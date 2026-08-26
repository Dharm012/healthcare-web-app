import { 
  Injectable, NotFoundException, ForbiddenException, BadRequestException, 
  Logger, OnModuleInit, OnModuleDestroy 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateAppointmentDto, RejectAppointmentDto, CancelAppointmentDto 
} from './dto/appointment.dto';
import * as crypto from 'crypto';

@Injectable()
export class AppointmentsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppointmentsService.name);
  private sweeperInterval: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Run automated time-based expiration sweeper every 30 seconds
    this.sweeperInterval = setInterval(() => {
      this.autoExpireAppointments().catch(err => {
        this.logger.error(`Error in automated appointment sweeper: ${err.message}`);
      });
    }, 30000);
    this.logger.log('Automated appointment expiration background sweeper initialized.');
  }

  onModuleDestroy() {
    if (this.sweeperInterval) {
      clearInterval(this.sweeperInterval);
    }
  }

  /**
   * 1. Patient requests a new online appointment
   */
  async createAppointmentRequest(userId: string, dto: CreateAppointmentDto) {
    let patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      patientProfile = await this.prisma.patientProfile.create({
        data: { userId },
      });
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduledAt date format.');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: dto.doctorId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Selected doctor was not found.');
    }

    const duration = dto.duration || 30;

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doctor.id,
        scheduledAt: scheduledDate,
        duration,
        consultationType: (dto.consultationType as any) || 'VIDEO',
        status: 'PENDING',
        reason: dto.reason || 'General Medical Video Consultation',
      },
      include: {
        doctor: {
          include: {
            user: { select: { email: true } },
          },
        },
        patient: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    // In-app notification for Doctor
    await this.prisma.notification.create({
      data: {
        userId: doctor.userId,
        type: 'APPOINTMENT',
        title: 'New Online Appointment Request',
        message: `A patient requested a video consultation for ${scheduledDate.toUTCString()}. Please review and accept.`,
        priority: 'HIGH',
      },
    });

    // In-app notification for Patient
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'APPOINTMENT',
        title: 'Appointment Request Submitted',
        message: `Your request with ${doctor.fullName || 'the doctor'} is pending confirmation.`,
        priority: 'NORMAL',
      },
    });

    return appointment;
  }

  /**
   * Get all patient appointments
   */
  async getPatientAppointments(userId: string) {
    let patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      patientProfile = await this.prisma.patientProfile.create({
        data: { userId },
      });
    }

    return this.prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
      include: {
        doctor: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        participantLogs: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /**
   * Get all doctor appointments
   */
  async getDoctorAppointments(userId: string) {
    let doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      return [];
    }

    return this.prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        participantLogs: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /**
   * 2. Doctor accepts the appointment request
   * Generates secure unique video-call link, notifies users, locks start time
   */
  async acceptAppointment(userId: string, appointmentId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new ForbiddenException('Only doctors can accept appointment requests.');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.doctorId !== doctorProfile.id) {
      throw new ForbiddenException('You are not authorized to accept this appointment.');
    }

    // Generate secure unique video-call link
    const videoRoomId = `vcon-${crypto.randomBytes(8).toString('hex')}`;

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CONFIRMED',
        videoRoomId,
      },
      include: {
        doctor: { include: { user: { select: { email: true } } } },
        patient: { include: { user: { select: { email: true } } } },
      },
    });

    // Notify Patient
    await this.prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        type: 'APPOINTMENT',
        title: 'Appointment Confirmed & Video Link Ready',
        message: `Dr. ${doctorProfile.fullName || 'Doctor'} accepted your appointment. Your encrypted video room is ready and unlocks at the scheduled time.`,
        priority: 'HIGH',
        metadata: JSON.stringify({ videoRoomId, scheduledAt: appointment.scheduledAt }),
      },
    });

    // Notify Doctor
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'APPOINTMENT',
        title: 'Video Room Reserved',
        message: `Appointment confirmed with ${appointment.patient.user.email}. Video room ID: ${videoRoomId}.`,
        priority: 'NORMAL',
      },
    });

    return updated;
  }

  /**
   * 3. Doctor rejects the appointment request
   */
  async rejectAppointment(userId: string, appointmentId: string, dto: RejectAppointmentDto) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new ForbiddenException('Only doctors can decline appointment requests.');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.doctorId !== doctorProfile.id) {
      throw new ForbiddenException('You are not authorized to decline this appointment.');
    }

    const rejectionReason = dto.rejectionReason?.trim() || 'Doctor is unavailable at the requested time.';

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'REJECTED',
        cancellationReason: rejectionReason,
      },
    });

    // Notify Patient
    await this.prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        type: 'APPOINTMENT',
        title: 'Appointment Request Declined',
        message: `Your appointment request was declined. Reason: ${rejectionReason}`,
        priority: 'HIGH',
      },
    });

    return updated;
  }

  /**
   * 4. Doctor or Patient cancels appointment
   */
  async cancelAppointment(userId: string, appointmentId: string, dto: CancelAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    const isPatient = appointment.patient.userId === userId;
    const isDoctor = appointment.doctor.userId === userId;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('You are not authorized to cancel this appointment.');
    }

    const cancellationReason = dto.cancellationReason?.trim() || (isDoctor ? 'Canceled by Doctor.' : 'Canceled by Patient.');

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELED',
        cancellationReason,
      },
    });

    const otherUserId = isPatient ? appointment.doctor.userId : appointment.patient.userId;
    await this.prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'APPOINTMENT',
        title: 'Appointment Canceled',
        message: `The scheduled consultation was canceled. Reason: ${cancellationReason}`,
        priority: 'HIGH',
      },
    });

    return updated;
  }

  /**
   * 5. Strict Server-Side Video Room Authorization & Time-Lock Enforcement
   * Validates participant role, start-time restriction, duration window, and logs join events
   */
  async authorizeAndJoinVideoRoom(userId: string, roomId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { videoRoomId: roomId },
          { id: roomId },
        ],
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        participantLogs: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Consultation room not found.');
    }

    const isPatient = appointment.patient.userId === userId;
    const isDoctor = appointment.doctor.userId === userId;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException({
        allowed: false,
        reason: 'UNAUTHORIZED',
        message: 'Access Denied: You are not an authorized participant in this consultation.',
      });
    }

    const role = isDoctor ? 'DOCTOR' : 'PATIENT';
    const now = Date.now();
    const scheduledStart = new Date(appointment.scheduledAt).getTime();
    const scheduledEnd = scheduledStart + (appointment.duration || 30) * 60 * 1000;

    // Check 1: Premature Entry (Server-Side Start Time Lock)
    if (now < scheduledStart) {
      const remainingSeconds = Math.ceil((scheduledStart - now) / 1000);
      
      // Log join attempt in database
      await this.prisma.appointmentParticipantLog.create({
        data: {
          appointmentId: appointment.id,
          userId,
          role,
          eventType: 'JOIN_ATTEMPT',
          notes: 'Blocked: Attempted before scheduled appointment start time.',
        },
      });

      throw new ForbiddenException({
        allowed: false,
        reason: 'EARLY_JOIN_BLOCKED',
        message: 'The video consultation has not started yet. Rooms unlock strictly at the scheduled start time.',
        scheduledAt: appointment.scheduledAt,
        remainingSeconds,
      });
    }

    // Check 2: Expiration Window Passed
    if (now > scheduledEnd) {
      await this.prisma.appointmentParticipantLog.create({
        data: {
          appointmentId: appointment.id,
          userId,
          role,
          eventType: 'JOIN_ATTEMPT',
          notes: 'Blocked: Attempted after appointment duration expired.',
        },
      });

      if (appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            status: 'CANCELED',
            cancellationReason: 'Appointment time expired — Consultation not completed within duration.',
          },
        });
      }

      throw new ForbiddenException({
        allowed: false,
        reason: 'EXPIRED',
        message: 'This consultation session has expired and can no longer be joined.',
      });
    }

    // Check 3: Valid Time Window -> Authorize & Log Successful Join
    await this.prisma.appointmentParticipantLog.create({
      data: {
        appointmentId: appointment.id,
        userId,
        role,
        eventType: 'JOIN_SUCCESS',
        notes: 'Participant successfully entered the consultation video room.',
        joinedAt: new Date(),
      },
    });

    // Check if both Doctor and Patient have joined -> Transition to IN_PROGRESS
    const logs = await this.prisma.appointmentParticipantLog.findMany({
      where: {
        appointmentId: appointment.id,
        eventType: 'JOIN_SUCCESS',
      },
    });

    const hasDoctorJoined = logs.some(l => l.role === 'DOCTOR');
    const hasPatientJoined = logs.some(l => l.role === 'PATIENT');

    let currentStatus = appointment.status;
    if (hasDoctorJoined && hasPatientJoined && appointment.status === 'CONFIRMED') {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'IN_PROGRESS' },
      });
      currentStatus = 'IN_PROGRESS';
    }

    return {
      allowed: true,
      appointmentId: appointment.id,
      roomId: appointment.videoRoomId || appointment.id,
      status: currentStatus,
      role,
      doctorName: appointment.doctor.fullName || 'Dr. Dharm Patel',
      patientEmail: appointment.patient.user.email,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
    };
  }

  /**
   * 6. End Consultation
   * Sets status to COMPLETED if both participants joined, or CANCELED if only one joined
   */
  async endConsultation(userId: string, roomId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ videoRoomId: roomId }, { id: roomId }],
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        participantLogs: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Consultation room not found.');
    }

    const isPatient = appointment.patient.userId === userId;
    const isDoctor = appointment.doctor.userId === userId;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('Unauthorized.');
    }

    const role = isDoctor ? 'DOCTOR' : 'PATIENT';

    // Log LEAVE event
    await this.prisma.appointmentParticipantLog.create({
      data: {
        appointmentId: appointment.id,
        userId,
        role,
        eventType: 'LEAVE',
        notes: 'Participant ended/left the consultation.',
        leftAt: new Date(),
      },
    });

    // Check if both participants successfully joined at least once
    const successfulLogs = await this.prisma.appointmentParticipantLog.findMany({
      where: {
        appointmentId: appointment.id,
        eventType: 'JOIN_SUCCESS',
      },
    });

    const hasDoctorJoined = successfulLogs.some(l => l.role === 'DOCTOR');
    const hasPatientJoined = successfulLogs.some(l => l.role === 'PATIENT');
    const bothJoined = (hasDoctorJoined && hasPatientJoined) || appointment.status === 'IN_PROGRESS';

    let finalStatus: any = 'COMPLETED';
    let finalCancellationReason: string | null = null;

    if (bothJoined) {
      finalStatus = 'COMPLETED';
    } else {
      finalStatus = 'CANCELED';
      finalCancellationReason = 'Consultation ended — Participant did not join.';
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: finalStatus,
        cancellationReason: finalCancellationReason,
      },
    });

    if (finalStatus === 'COMPLETED') {
      // Notify Patient
      await this.prisma.notification.create({
        data: {
          userId: appointment.patient.userId,
          type: 'APPOINTMENT',
          title: 'Consultation Completed',
          message: `Your video consultation with ${appointment.doctor.fullName || 'Doctor'} has concluded successfully. Summary is saved in your Appointments Archive.`,
          priority: 'NORMAL',
        },
      });

      // Notify Doctor
      await this.prisma.notification.create({
        data: {
          userId: appointment.doctor.userId,
          type: 'APPOINTMENT',
          title: 'Consultation Completed',
          message: `Consultation session with ${appointment.patient.user.email} completed successfully.`,
          priority: 'NORMAL',
        },
      });
    }

    return updated;
  }

  /**
   * 7. Automated Background Sweeper
   * Sweeps expired appointments and marks them CANCELED with appropriate reasons
   */
  async autoExpireAppointments() {
    const now = new Date();

    // 1. Expire PENDING appointments whose start time has already passed
    await this.prisma.appointment.updateMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lt: now },
      },
      data: {
        status: 'CANCELED',
        cancellationReason: 'Appointment request expired without doctor confirmation.',
      },
    });

    // 2. Find CONFIRMED or IN_PROGRESS appointments whose duration has completely passed
    const activeAppointments = await this.prisma.appointment.findMany({
      where: {
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      include: {
        participantLogs: {
          where: { eventType: 'JOIN_SUCCESS' },
        },
      },
    });

    for (const apt of activeAppointments) {
      const scheduledStart = new Date(apt.scheduledAt).getTime();
      const scheduledEnd = scheduledStart + (apt.duration || 30) * 60 * 1000;

      if (Date.now() > scheduledEnd) {
        const hasDoctor = apt.participantLogs.some(l => l.role === 'DOCTOR');
        const hasPatient = apt.participantLogs.some(l => l.role === 'PATIENT');

        if (hasDoctor && hasPatient) {
          await this.prisma.appointment.update({
            where: { id: apt.id },
            data: { status: 'COMPLETED' },
          });
        } else {
          await this.prisma.appointment.update({
            where: { id: apt.id },
            data: {
              status: 'CANCELED',
              cancellationReason: 'Appointment time expired — Participant did not join.',
            },
          });
        }
      }
    }
  }
}
