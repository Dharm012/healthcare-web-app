import { PrismaClient, Role, UserStatus, Gender, BloodGroup, ConsultationType, AppointmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@healthconnect.com' },
    update: {},
    create: {
      email: 'admin@healthconnect.com',
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const doc1 = await prisma.user.upsert({
    where: { email: 'sarah.j@healthconnect.com' },
    update: {},
    create: {
      email: 'sarah.j@healthconnect.com',
      passwordHash,
      role: Role.DOCTOR,
      status: UserStatus.ACTIVE,
      doctorProfile: {
        create: {
          specialization: 'Cardiologist',
          qualifications: 'MD, DM Cardiology',
          licenseNumber: 'MCI-10293',
          experience: 12,
          consultationFee: 1500,
          verificationStatus: 'APPROVED',
        },
      },
    },
  });

  const doc2 = await prisma.user.upsert({
    where: { email: 'lisa.c@healthconnect.com' },
    update: {},
    create: {
      email: 'lisa.c@healthconnect.com',
      passwordHash,
      role: Role.DOCTOR,
      status: UserStatus.ACTIVE,
      doctorProfile: {
        create: {
          specialization: 'General Physician',
          qualifications: 'MBBS, MD',
          licenseNumber: 'MCI-99882',
          experience: 8,
          consultationFee: 800,
          verificationStatus: 'APPROVED',
        },
      },
    },
  });

  const patient1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      passwordHash,
      role: Role.PATIENT,
      status: UserStatus.ACTIVE,
      patientProfile: {
        create: {
          dateOfBirth: new Date('1990-05-15'),
          gender: Gender.MALE,
          bloodGroup: BloodGroup.O_POS,
          medicalHistory: 'Hyperlipidemia',
        },
      },
    },
  });

  // Get Profiles
  const doc1Profile = await prisma.doctorProfile.findUnique({ where: { userId: doc1.id } });
  const patient1Profile = await prisma.patientProfile.findUnique({ where: { userId: patient1.id } });

  // 2. Create Appointments
  if (doc1Profile && patient1Profile) {
    await prisma.appointment.create({
      data: {
        patientId: patient1Profile.id,
        doctorId: doc1Profile.id,
        scheduledAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 30,
        consultationType: ConsultationType.VIDEO,
        status: AppointmentStatus.CONFIRMED,
        reason: 'Follow-up on Lipid Panel',
      },
    });

    await prisma.appointment.create({
      data: {
        patientId: patient1Profile.id,
        doctorId: doc1Profile.id,
        scheduledAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        duration: 30,
        consultationType: ConsultationType.IN_PERSON,
        status: AppointmentStatus.COMPLETED,
        reason: 'Routine Checkup',
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
