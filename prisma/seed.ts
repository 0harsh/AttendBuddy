// File: prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database cleanup and seeding...');

  try {
    // 1. Delete all existing data (clean slate)
    console.log('🗑️ Deleting all existing data...');
    
    await prisma.reminder.deleteMany({});
    console.log('   ✅ Reminders deleted');
    
    await prisma.attendance.deleteMany({});
    console.log('   ✅ Attendance records deleted');
    
    await prisma.course.deleteMany({});
    console.log('   ✅ Courses deleted');
    
    await prisma.user.deleteMany({});
    console.log('   ✅ Users deleted');

    console.log('🎯 Database cleaned successfully!');

    // 2. Create fresh users with proper timezone data
    console.log('\n👥 Creating fresh users...');
    
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: "password123"
        timezone: 'Asia/Kolkata', // India timezone
      },
    });
    console.log('   ✅ User created: John Doe (India)');

    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: "password123"
        timezone: 'America/New_York', // US Eastern timezone
      },
    });
    console.log('   ✅ User created: Jane Smith (US Eastern)');

    const user3 = await prisma.user.create({
      data: {
        name: 'Yuki Tanaka',
        email: 'yuki@example.com',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: "password123"
        timezone: 'Asia/Tokyo', // Japan timezone
      },
    });
    console.log('   ✅ User created: Yuki Tanaka (Japan)');

    const user4 = await prisma.user.create({
      data: {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: "password123"
        timezone: 'Europe/London', // UK timezone
      },
    });
    console.log('   ✅ User created: Emma Wilson (UK)');

    // 3. Create courses for each user
    console.log('\n📚 Creating courses...');
    
    const course1 = await prisma.course.create({
      data: {
        name: 'Mathematics',
        userId: user1.id,
        totalAttendance: 0,
        presents: 0,
        absents: 0,
      },
    });
    console.log('   ✅ Course created: Mathematics for John');

    const course2 = await prisma.course.create({
      data: {
        name: 'Physics',
        userId: user1.id,
        totalAttendance: 0,
        presents: 0,
        absents: 0,
      },
    });
    console.log('   ✅ Course created: Physics for John');

    const course3 = await prisma.course.create({
      data: {
        name: 'Computer Science',
        userId: user2.id,
        totalAttendance: 0,
        presents: 0,
        absents: 0,
      },
    });
    console.log('   ✅ Course created: Computer Science for Jane');

    const course4 = await prisma.course.create({
      data: {
        name: 'Engineering',
        userId: user3.id,
        totalAttendance: 0,
        presents: 0,
        absents: 0,
      },
    });
    console.log('   ✅ Course created: Engineering for Yuki');

    const course5 = await prisma.course.create({
      data: {
        name: 'Business',
        userId: user4.id,
        totalAttendance: 0,
        presents: 0,
        absents: 0,
      },
    });
    console.log('   ✅ Course created: Business for Emma');

    // 4. Create sample attendance records (past dates)
    console.log('\n📅 Creating sample attendance records...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    // John's attendance (India timezone)
    await prisma.attendance.create({
      data: {
        userId: user1.id,
        courseId: course1.id,
        date: new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())),
        status: 'Present',
      },
    });

    await prisma.attendance.create({
      data: {
        userId: user1.id,
        courseId: course1.id,
        date: new Date(Date.UTC(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate())),
        status: 'Absent',
      },
    });

    await prisma.attendance.create({
      data: {
        userId: user1.id,
        courseId: course2.id,
        date: new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())),
        status: 'Present',
      },
    });

    console.log('   ✅ Attendance records created for John');

    // Jane's attendance (US Eastern timezone)
    await prisma.attendance.create({
      data: {
        userId: user2.id,
        courseId: course3.id,
        date: new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())),
        status: 'Present',
      },
    });

    console.log('   ✅ Attendance records created for Jane');

    // 5. Create sample reminders (future dates in UTC)
    console.log('\n⏰ Creating sample reminders...');
    
    // Tomorrow's reminders for different users
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // John's reminder (India - will be processed at UTC hour 8)
    await prisma.reminder.create({
      data: {
        userId: user1.id,
        courseId: course1.id,
        reminderDate: new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())),
        message: 'Don\'t forget your math homework!',
      },
    });

    // Jane's reminder (US Eastern - will be processed at UTC hour 16)
    await prisma.reminder.create({
      data: {
        userId: user2.id,
        courseId: course3.id,
        reminderDate: new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())),
        message: 'Prepare for the coding interview',
      },
    });

    // Yuki's reminder (Japan - will be processed at UTC hour 4)
    await prisma.reminder.create({
      data: {
        userId: user3.id,
        courseId: course4.id,
        reminderDate: new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())),
        message: 'Engineering project deadline',
      },
    });

    // Emma's reminder (UK - will be processed at UTC hour 14)
    await prisma.reminder.create({
      data: {
        userId: user4.id,
        courseId: course5.id,
        reminderDate: new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())),
        message: 'Business presentation preparation',
      },
    });

    console.log('   ✅ Reminders created for all users');

    // 6. Update course statistics
    console.log('\n📊 Updating course statistics...');
    
    // Update John's Mathematics course
    await prisma.course.update({
      where: { id: course1.id },
      data: {
        totalAttendance: 2,
        presents: 1,
        absents: 1,
      },
    });

    // Update John's Physics course
    await prisma.course.update({
      where: { id: course2.id },
      data: {
        totalAttendance: 1,
        presents: 1,
        absents: 0,
      },
    });

    // Update Jane's Computer Science course
    await prisma.course.update({
      where: { id: course3.id },
      data: {
        totalAttendance: 1,
        presents: 1,
        absents: 0,
      },
    });

    console.log('   ✅ Course statistics updated');

    // 7. Display summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   👥 Users: 4 (with different timezones)`);
    console.log(`   📚 Courses: 5`);
    console.log(`   📅 Attendance records: 5`);
    console.log(`   ⏰ Reminders: 4 (for tomorrow)`);
    console.log('\n🌍 Timezone distribution:');
    console.log(`   🇮🇳 Asia/Kolkata (John): UTC+5:30 - processed at UTC hour 8`);
    console.log(`   🇺🇸 America/New_York (Jane): UTC-5 - processed at UTC hour 16`);
    console.log(`   🇯🇵 Asia/Tokyo (Yuki): UTC+9 - processed at UTC hour 4`);
    console.log(`   🇬🇧 Europe/London (Emma): UTC+0 - processed at UTC hour 14`);
    console.log('\n🔑 Test credentials:');
    console.log(`   Email: john@example.com, Password: password123`);
    console.log(`   Email: jane@example.com, Password: password123`);
    console.log(`   Email: yuki@example.com, Password: password123`);
    console.log(`   Email: emma@example.com, Password: password123`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
