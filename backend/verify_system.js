const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Verifying Complete System State ===');

  // 1. Check Dr. Dharm Patel user & profile
  const doctor = await prisma.user.findUnique({
    where: { email: 'healthcareantigravity1@gmail.com' },
    include: { doctorProfile: true },
  });

  if (!doctor || !doctor.doctorProfile) {
    throw new Error('Dr. Dharm Patel profile not found!');
  }
  console.log('✅ Doctor account verified:', doctor.email, '| Name:', doctor.doctorProfile.fullName, '| Spec:', doctor.doctorProfile.specialization);

  // 2. Check patient account (e.g. john.doe@example.com)
  const patient = await prisma.user.findUnique({
    where: { email: 'john.doe@example.com' },
    include: { patientProfile: true },
  });

  if (patient) {
    console.log('✅ Patient account verified:', patient.email, '| Profile ID:', patient.patientProfile?.id);
  }

  // 3. Check all appointments
  const appts = await prisma.appointment.findMany({
    include: { doctor: true, patient: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log(`✅ Appointments in DB: ${appts.length}`);
  appts.forEach(a => {
    console.log(`- Appointment ${a.id}: status=${a.status}, doctor=${a.doctor?.fullName || 'N/A'}, scheduledAt=${a.scheduledAt.toISOString()}`);
  });

  console.log('=== Verification Passed ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
