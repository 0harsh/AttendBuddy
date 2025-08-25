// File: prisma/cleanup.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting database cleanup...');

  try {
    // Delete all existing data
    console.log('🗑️ Deleting all existing data...');
    
    const remindersDeleted = await prisma.reminder.deleteMany({});
    console.log(`   ✅ ${remindersDeleted.count} reminders deleted`);
    
    const attendanceDeleted = await prisma.attendance.deleteMany({});
    console.log(`   ✅ ${attendanceDeleted.count} attendance records deleted`);
    
    const coursesDeleted = await prisma.course.deleteMany({});
    console.log(`   ✅ ${coursesDeleted.count} courses deleted`);
    
    const usersDeleted = await prisma.user.deleteMany({});
    console.log(`   ✅ ${usersDeleted.count} users deleted`);

    console.log('\n🎯 Database cleaned successfully!');
    console.log('\n📊 Summary of deleted data:');
    console.log(`   👥 Users: ${usersDeleted.count}`);
    console.log(`   📚 Courses: ${coursesDeleted.count}`);
    console.log(`   📅 Attendance records: ${attendanceDeleted.count}`);
    console.log(`   ⏰ Reminders: ${remindersDeleted.count}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
