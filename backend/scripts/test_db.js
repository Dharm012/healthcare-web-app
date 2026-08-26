const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    const userCount = await prisma.user.count();
    console.log('Database connected successfully! Total users:', userCount);
  } catch (err) {
    console.error('Connection test failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
