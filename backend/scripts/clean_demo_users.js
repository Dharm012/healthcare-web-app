const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { patientProfile: true, doctorProfile: true }
  });
  console.log('--- CURRENT USERS IN DB ---');
  users.forEach(u => {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | PatientName: ${u.patientProfile?.fullName} | DoctorName: ${u.doctorProfile?.fullName}`);
  });

  const demoEmails = [
    'john.doe@example.com',
    'jane.doe@example.com',
    'demo.patient@example.com',
    'patient@example.com',
    'testuser123@example.com'
  ];

  for (const email of demoEmails) {
    const found = await prisma.user.findUnique({ where: { email } });
    if (found) {
      console.log(`Removing demo user: ${email}`);
      const patient = await prisma.patientProfile.findUnique({ where: { userId: found.id } });
      if (patient) {
        // Delete related logs
        const apts = await prisma.appointment.findMany({ where: { patientId: patient.id } });
        for (const apt of apts) {
          await prisma.appointmentParticipantLog.deleteMany({ where: { appointmentId: apt.id } });
        }
        await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
        await prisma.medicalRecord.deleteMany({ where: { patientId: patient.id } });
        await prisma.prescription.deleteMany({ where: { patientId: patient.id } });
        await prisma.vital.deleteMany({ where: { patientId: patient.id } });
        await prisma.patientProfile.delete({ where: { id: patient.id } });
      }
      await prisma.notification.deleteMany({ where: { userId: found.id } });
      await prisma.user.delete({ where: { id: found.id } });
      console.log(`✓ Demo user ${email} deleted successfully.`);
    }
  }

  const remaining = await prisma.user.findMany({
    include: { patientProfile: true, doctorProfile: true }
  });
  console.log('\n--- REMAINING REAL REGISTERED USERS ---');
  remaining.forEach(u => {
    console.log(`- Email: ${u.email} | Role: ${u.role} | Name: ${u.patientProfile?.fullName || u.doctorProfile?.fullName || 'N/A'}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
