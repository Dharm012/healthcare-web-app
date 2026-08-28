import { 
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  SavePrescriptionDraftDto, CreateDirectPrescriptionDto, SkipReminderDto, MedicineItemDto 
} from './dto/prescriptions.dto';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Parse timings array from various input formats
   */
  private normalizeTimings(timingInput: any): string[] {
    if (!timingInput) return ['09:00 AM'];
    if (Array.isArray(timingInput)) {
      return timingInput.filter(t => typeof t === 'string' && t.trim().length > 0);
    }
    if (typeof timingInput === 'string') {
      try {
        const parsed = JSON.parse(timingInput);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return timingInput.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    return ['09:00 AM'];
  }

  /**
   * Helper: Calculate duration days from string or number
   */
  private parseDurationDays(duration: string | undefined, durationDays: number | undefined): number {
    if (durationDays && durationDays > 0) return durationDays;
    if (duration) {
      const match = duration.match(/(\d+)/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed > 0) return parsed;
      }
    }
    return 5;
  }

  /**
   * 1. Get or initialize a Prescription draft for a video consultation room
   */
  async getOrCreateDraftForRoom(userId: string, roomId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ videoRoomId: roomId }, { id: roomId }],
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        consultation: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Consultation room not found.');
    }

    const isPatient = appointment.patient.userId === userId;
    const isDoctor = appointment.doctor.userId === userId;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('You are not an authorized participant in this room.');
    }

    // Look for existing prescription attached to this appointment or consultation
    let prescription = await this.prisma.prescription.findFirst({
      where: {
        OR: [
          { consultationId: appointment.consultation?.id || '' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, status: 'DRAFT' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, consultationId: appointment.id },
        ],
      },
      include: {
        medications: {
          orderBy: { createdAt: 'asc' },
        },
        doctor: { include: { user: { select: { email: true } } } },
        patient: { include: { user: { select: { email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If none exists and user is Doctor, create a new DRAFT
    if (!prescription && isDoctor) {
      let consultationId = appointment.consultation?.id;
      if (!consultationId) {
        const existingConsultation = await this.prisma.consultation.findUnique({
          where: { appointmentId: appointment.id },
        });
        if (existingConsultation) {
          consultationId = existingConsultation.id;
        } else {
          const newConsultation = await this.prisma.consultation.create({
            data: {
              appointmentId: appointment.id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId,
              status: 'IN_PROGRESS',
            },
          });
          consultationId = newConsultation.id;
        }
      }

      prescription = await this.prisma.prescription.create({
        data: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          consultationId,
          status: 'DRAFT',
          diagnosis: appointment.reason || 'General Tele-Consultation',
        },
        include: {
          medications: true,
          doctor: { include: { user: { select: { email: true } } } },
          patient: { include: { user: { select: { email: true } } } },
        },
      });
    }

    return {
      prescription,
      appointment: {
        id: appointment.id,
        roomId: appointment.videoRoomId || appointment.id,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        patientName: appointment.patient.fullName || appointment.patient.user.email.split('@')[0],
        doctorName: appointment.doctor.fullName || 'Dr. Dharm Patel',
        doctorSpecialty: appointment.doctor.specialization || 'General Physician',
        doctorLicense: appointment.doctor.licenseNumber || 'MCI-REG-2026',
      },
      isDoctor,
    };
  }

  /**
   * 2. Save/Update medicine draft (Autosave support)
   */
  async saveDraft(userId: string, roomId: string, dto: SavePrescriptionDraftDto) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ videoRoomId: roomId }, { id: roomId }],
      },
      include: {
        doctor: true,
        patient: true,
        consultation: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Consultation room not found.');
    }

    if (appointment.doctor.userId !== userId) {
      throw new ForbiddenException('Only the consulting doctor can modify prescriptions.');
    }

    // Find or create prescription
    let prescription = await this.prisma.prescription.findFirst({
      where: {
        OR: [
          { consultationId: appointment.consultation?.id || '' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, status: 'DRAFT' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, consultationId: appointment.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!prescription) {
      let consultationId = appointment.consultation?.id;
      if (!consultationId) {
        const existingConsultation = await this.prisma.consultation.findUnique({
          where: { appointmentId: appointment.id },
        });
        if (existingConsultation) {
          consultationId = existingConsultation.id;
        } else {
          const newConsultation = await this.prisma.consultation.create({
            data: {
              appointmentId: appointment.id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId,
              status: 'IN_PROGRESS',
            },
          });
          consultationId = newConsultation.id;
        }
      }

      prescription = await this.prisma.prescription.create({
        data: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          consultationId,
          status: 'DRAFT',
        },
      });
    }

    // Update prescription details
    await this.prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        diagnosis: dto.diagnosis?.trim() || prescription.diagnosis || 'Clinical Diagnosis',
        notes: dto.notes?.trim() || null,
        status: prescription.status === 'FINALIZED' ? 'FINALIZED' : 'DRAFT',
      },
    });

    // Replace medications in draft atomically
    await this.prisma.prescriptionMedication.deleteMany({
      where: { prescriptionId: prescription.id },
    });

    if (dto.medicines && dto.medicines.length > 0) {
      for (const med of dto.medicines) {
        const timings = this.normalizeTimings(med.timing);
        const durationDays = this.parseDurationDays(med.duration, med.durationDays);
        const startDate = med.startDate ? new Date(med.startDate) : new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        await this.prisma.prescriptionMedication.create({
          data: {
            prescriptionId: prescription.id,
            medicineName: med.medicineName.trim(),
            medicineType: med.medicineType || 'TABLET',
            dosage: med.dosage.trim(),
            route: med.route || 'ORAL',
            frequency: med.frequency.trim(),
            timing: JSON.stringify(timings),
            duration: med.duration?.trim() || `${durationDays} days`,
            durationDays,
            startDate,
            endDate,
            instructions: med.instructions?.trim() || 'Take as directed',
          },
        });
      }
    }

    return this.prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        medications: { orderBy: { createdAt: 'asc' } },
        doctor: true,
        patient: true,
      },
    });
  }

  /**
   * 3. Finalize prescription in call
   */
  async finalizePrescription(userId: string, roomId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ videoRoomId: roomId }, { id: roomId }],
      },
      include: {
        doctor: true,
        patient: true,
        consultation: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Consultation room not found.');
    }

    if (appointment.doctor.userId !== userId) {
      throw new ForbiddenException('Only the consulting doctor can finalize prescriptions.');
    }

    const prescription = await this.prisma.prescription.findFirst({
      where: {
        OR: [
          { consultationId: appointment.consultation?.id || '' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, status: 'DRAFT' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, consultationId: appointment.id },
        ],
      },
      include: { medications: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!prescription || prescription.medications.length === 0) {
      throw new BadRequestException('Cannot finalize an empty prescription. Please add at least one medicine.');
    }

    // Validate all medicines
    for (const med of prescription.medications) {
      if (!med.medicineName || !med.dosage || !med.frequency) {
        throw new BadRequestException(`Incomplete medicine details for "${med.medicineName || 'Unnamed Medicine'}". Please check name, dosage, and frequency.`);
      }
      if (!med.durationDays || med.durationDays <= 0) {
        throw new BadRequestException(`Invalid duration for "${med.medicineName}". Duration must be at least 1 day.`);
      }
    }

    const updated = await this.prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: 'FINALIZED',
        finalizedAt: new Date(),
      },
      include: {
        medications: true,
        doctor: true,
        patient: true,
      },
    });

    this.logger.log(`Prescription ${updated.id} FINALIZED by doctor ${userId} for room ${roomId}`);
    return updated;
  }

  /**
   * 4. Reopen prescription to DRAFT if consultation is still active
   */
  async reopenPrescription(userId: string, roomId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ videoRoomId: roomId }, { id: roomId }],
      },
      include: {
        doctor: true,
      },
    });

    if (!appointment || appointment.doctor.userId !== userId) {
      throw new ForbiddenException('Unauthorized.');
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELED') {
      throw new BadRequestException('Cannot edit prescription for an already completed consultation.');
    }

    const prescription = await this.prisma.prescription.findFirst({
      where: {
        OR: [
          { consultationId: appointment.id },
          { doctorId: appointment.doctorId, status: 'FINALIZED' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found.');
    }

    return this.prisma.prescription.update({
      where: { id: prescription.id },
      data: { status: 'DRAFT' },
      include: { medications: true },
    });
  }

  /**
   * 5. Consultation Concluded Handler: Generate Medicine Reminders automatically
   */
  async onConsultationEnded(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        consultation: true,
      },
    });

    if (!appointment) return;

    // Find prescription
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        OR: [
          { consultationId: appointment.consultation?.id || '' },
          { consultationId: appointment.id },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, status: 'FINALIZED' },
          { patientId: appointment.patientId, doctorId: appointment.doctorId, status: 'DRAFT' },
        ],
      },
      include: { medications: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!prescription || prescription.medications.length === 0) {
      this.logger.log(`No medicines prescribed for appointment ${appointmentId}`);
      return;
    }

    let consultationId = appointment.consultation?.id || prescription.consultationId;
    if (!consultationId) {
      const existingConsultation = await this.prisma.consultation.findUnique({
        where: { appointmentId: appointment.id },
      });
      if (existingConsultation) {
        consultationId = existingConsultation.id;
      } else {
        const newConsultation = await this.prisma.consultation.create({
          data: {
            appointmentId: appointment.id,
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            status: 'COMPLETED',
          },
        });
        consultationId = newConsultation.id;
      }
    }

    // Activate prescription
    await this.prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: 'ACTIVE',
        finalizedAt: prescription.finalizedAt || new Date(),
        consultationId,
      },
    });

    // Generate individual daily MedicationSchedule entries
    const patientId = appointment.patientId;

    for (const med of prescription.medications) {
      const timings = this.normalizeTimings(med.timing);
      const durationDays = med.durationDays || 5;
      const startDate = med.startDate ? new Date(med.startDate) : new Date();

      // Clear any previous pending schedules for this medication
      await this.prisma.medicationSchedule.deleteMany({
        where: { medicationId: med.id },
      });

      // Generate schedules for each day
      for (let day = 0; day < durationDays; day++) {
        const scheduledDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        scheduledDate.setHours(0, 0, 0, 0);

        for (const timeStr of timings) {
          await this.prisma.medicationSchedule.create({
            data: {
              patientId,
              medicationId: med.id,
              medicineName: med.medicineName,
              medicineType: med.medicineType || 'TABLET',
              dosage: med.dosage,
              instructions: med.instructions || 'Take after food',
              scheduledDate,
              scheduledTime: timeStr,
              dayNumber: day + 1,
              totalDays: durationDays,
              reminderEnabled: true,
              adherenceStatus: 'PENDING',
            },
          });
        }
      }
    }

    // Create In-App Notification for Patient
    await this.prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        type: 'REMINDER',
        title: 'Prescription & Medicine Reminders Activated',
        message: `Dr. ${appointment.doctor.fullName || 'Doctor'} has finalized your prescription with ${prescription.medications.length} medicines. Today's reminders are now active in your dashboard.`,
        priority: 'HIGH',
        metadata: JSON.stringify({ prescriptionId: prescription.id }),
      },
    });

    this.logger.log(`Generated medication schedules for patient ${patientId} from prescription ${prescription.id}`);
  }

  /**
   * 6. Get Today's Medicine Reminders for Patient
   */
  async getPatientTodayReminders(userId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch schedules matching today's date
    const schedules = await this.prisma.medicationSchedule.findMany({
      where: {
        patientId: patientProfile.id,
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        prescriptionMedication: {
          include: {
            prescription: {
              include: {
                doctor: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return schedules.map(s => ({
      id: s.id,
      medicationId: s.medicationId,
      medicineName: s.medicineName,
      medicineType: s.medicineType || 'TABLET',
      dosage: s.dosage,
      instructions: s.instructions,
      scheduledTime: s.scheduledTime,
      scheduledDate: s.scheduledDate,
      dayNumber: s.dayNumber || 1,
      totalDays: s.totalDays || 5,
      adherenceStatus: s.adherenceStatus, // PENDING, TAKEN, SKIPPED, MISSED, EXPIRED
      takenAt: s.takenAt,
      skippedAt: s.skippedAt,
      skipReason: s.skipReason,
      doctorName: s.prescriptionMedication?.prescription?.doctor?.fullName || 'Dr. Dharm Patel',
    }));
  }

  /**
   * 7. Get All Medication Reminders / History for Patient
   */
  async getPatientAllReminders(userId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) return [];

    return this.prisma.medicationSchedule.findMany({
      where: { patientId: patientProfile.id },
      orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'asc' }],
    });
  }

  /**
   * 8. Mark reminder as taken
   */
  async markReminderTaken(userId: string, scheduleId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      throw new ForbiddenException('Patient profile not found.');
    }

    const schedule = await this.prisma.medicationSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || schedule.patientId !== patientProfile.id) {
      throw new NotFoundException('Medication reminder not found.');
    }

    return this.prisma.medicationSchedule.update({
      where: { id: scheduleId },
      data: {
        adherenceStatus: 'TAKEN',
        takenAt: new Date(),
      },
    });
  }

  /**
   * 9. Skip reminder with optional reason
   */
  async skipReminder(userId: string, scheduleId: string, dto: SkipReminderDto) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      throw new ForbiddenException('Patient profile not found.');
    }

    const schedule = await this.prisma.medicationSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || schedule.patientId !== patientProfile.id) {
      throw new NotFoundException('Medication reminder not found.');
    }

    return this.prisma.medicationSchedule.update({
      where: { id: scheduleId },
      data: {
        adherenceStatus: 'SKIPPED',
        skippedAt: new Date(),
        skipReason: dto.reason?.trim() || 'Skipped by patient',
      },
    });
  }

  /**
   * 10. Get all Prescriptions for Patient
   */
  async getPatientPrescriptions(userId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) return [];

    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        patientId: patientProfile.id,
        status: { in: ['ACTIVE', 'FINALIZED', 'COMPLETED'] },
      },
      include: {
        medications: {
          orderBy: { createdAt: 'asc' },
        },
        doctor: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return prescriptions.map(rx => ({
      id: rx.id,
      date: rx.issuedAt,
      diagnosis: rx.diagnosis || 'General Medical Consultation',
      notes: rx.notes,
      status: rx.status,
      doctor: {
        id: rx.doctor.id,
        name: rx.doctor.fullName || 'Dr. Dharm Patel',
        specialty: rx.doctor.specialization || 'General Physician',
        license: rx.doctor.licenseNumber || 'MCI-REG-2026',
        qualifications: rx.doctor.qualifications || 'MBBS, MD',
        email: rx.doctor.user?.email,
      },
      medications: rx.medications.map(m => {
        let timings: string[] = [];
        try {
          timings = JSON.parse(m.timing || '["09:00 AM"]');
        } catch {
          timings = [m.timing || '09:00 AM'];
        }
        return {
          id: m.id,
          name: m.medicineName,
          medicineType: m.medicineType || 'TABLET',
          dosage: m.dosage,
          frequency: m.frequency,
          timing: timings.join(', '),
          duration: m.duration,
          durationDays: m.durationDays || 5,
          startDate: m.startDate,
          endDate: m.endDate,
          instructions: m.instructions || 'Take after food',
        };
      }),
    }));
  }

  /**
   * 11. Get all Prescriptions for Doctor
   */
  async getDoctorPrescriptions(userId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) return [];

    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        doctorId: doctorProfile.id,
      },
      include: {
        medications: true,
        patient: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prescriptions.map(rx => ({
      id: rx.id,
      patient: rx.patient.fullName || rx.patient.user?.email?.split('@')[0] || 'Patient',
      patientEmail: rx.patient.user?.email,
      patientId: rx.patient.id,
      date: rx.issuedAt,
      diagnosis: rx.diagnosis || 'Clinical Diagnosis',
      notes: rx.notes,
      status: rx.status,
      medications: rx.medications.map(m => {
        let timings: string[] = [];
        try {
          timings = JSON.parse(m.timing || '["09:00 AM"]');
        } catch {
          timings = [m.timing || '09:00 AM'];
        }
        return {
          id: m.id,
          name: m.medicineName,
          medicineType: m.medicineType || 'TABLET',
          dosage: m.dosage,
          frequency: m.frequency,
          timing: timings.join(', '),
          duration: m.duration,
          instructions: m.instructions,
        };
      }),
    }));
  }

  /**
   * 12. Create Direct Prescription from Doctor dashboard
   */
  async createDirectPrescription(userId: string, dto: CreateDirectPrescriptionDto) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new ForbiddenException('Doctor profile not found.');
    }

    // Find patient by ID, email, or find first patient
    let patientId = dto.patientId;
    if (!patientId && dto.patientEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.patientEmail },
        include: { patientProfile: true },
      });
      if (user?.patientProfile) patientId = user.patientProfile.id;
    }

    if (!patientId) {
      const defaultPatient = await this.prisma.patientProfile.findFirst();
      if (!defaultPatient) throw new NotFoundException('No registered patient found to assign prescription.');
      patientId = defaultPatient.id;
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        doctorId: doctorProfile.id,
        patientId,
        diagnosis: dto.diagnosis?.trim() || 'Clinical Prescription',
        notes: dto.notes?.trim(),
        status: 'ACTIVE',
        finalizedAt: new Date(),
      },
    });

    if (dto.medicines && dto.medicines.length > 0) {
      for (const med of dto.medicines) {
        const timings = this.normalizeTimings(med.timing);
        const durationDays = this.parseDurationDays(med.duration, med.durationDays);
        const startDate = med.startDate ? new Date(med.startDate) : new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const createdMed = await this.prisma.prescriptionMedication.create({
          data: {
            prescriptionId: prescription.id,
            medicineName: med.medicineName.trim(),
            medicineType: med.medicineType || 'TABLET',
            dosage: med.dosage.trim(),
            route: med.route || 'ORAL',
            frequency: med.frequency.trim(),
            timing: JSON.stringify(timings),
            duration: med.duration?.trim() || `${durationDays} days`,
            durationDays,
            startDate,
            endDate,
            instructions: med.instructions?.trim() || 'Take as directed',
          },
        });

        // Create daily reminders
        for (let day = 0; day < durationDays; day++) {
          const scheduledDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
          scheduledDate.setHours(0, 0, 0, 0);

          for (const timeStr of timings) {
            await this.prisma.medicationSchedule.create({
              data: {
                patientId,
                medicationId: createdMed.id,
                medicineName: createdMed.medicineName,
                medicineType: createdMed.medicineType || 'TABLET',
                dosage: createdMed.dosage,
                instructions: createdMed.instructions || 'Take after food',
                scheduledDate,
                scheduledTime: timeStr,
                dayNumber: day + 1,
                totalDays: durationDays,
                reminderEnabled: true,
                adherenceStatus: 'PENDING',
              },
            });
          }
        }
      }
    }

    return this.prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        medications: true,
        patient: true,
        doctor: true,
      },
    });
  }

  /**
   * 13. Get Single Prescription by ID
   */
  async getPrescriptionById(userId: string, id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        medications: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found.');
    }

    const isPatient = prescription.patient.userId === userId;
    const isDoctor = prescription.doctor.userId === userId;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('Access denied.');
    }

    return prescription;
  }
}
