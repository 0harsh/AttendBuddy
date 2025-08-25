// Local test script for the cron API
// Run this with: node test-cron-local.js

const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

// Mock environment variables for local testing
process.env.CRON_SECRET = 'test-secret-123';
process.env.RESEND_API_KEY = 'test-api-key';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Mock the cron API logic
async function testCronLogic() {
  try {
    console.log('🚀 Testing cron logic locally...');
    const startTime = Date.now();

    // Get current UTC time to determine which timezone group to process
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    console.log(`🔍 Testing at UTC hour: ${currentHour}`);
    console.log(`📅 Current UTC time: ${now.toISOString()}`);

    // Define timezone groups (same as in the API)
    const timezoneGroups = {
      0: ['Pacific/Auckland', 'Pacific/Fiji'],
      1: ['Asia/Kamchatka', 'Pacific/Majuro'],
      2: ['Asia/Vladivostok', 'Asia/Magadan'],
      3: ['Asia/Sakhalin', 'Asia/Ust-Nera'],
      4: ['Asia/Tokyo', 'Asia/Seoul', 'Asia/Pyongyang'],
      5: ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore'],
      6: ['Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Jakarta'],
      7: ['Asia/Almaty', 'Asia/Dhaka', 'Asia/Omsk'],
      8: ['Asia/Kolkata', 'Asia/Colombo', 'Asia/Kathmandu'],
      9: ['Asia/Tashkent', 'Asia/Yekaterinburg'],
      10: ['Asia/Dubai', 'Asia/Baku', 'Asia/Tbilisi'],
      11: ['Europe/Moscow', 'Europe/Volgograd'],
      12: ['Europe/Athens', 'Europe/Bucharest', 'Europe/Helsinki'],
      13: ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome'],
      14: ['Europe/London', 'Europe/Dublin'],
      15: ['America/Sao_Paulo', 'America/Argentina/Buenos_Aires'],
      16: ['America/New_York', 'America/Toronto'],
      17: ['America/Chicago', 'America/Mexico_City'],
      18: ['America/Denver', 'America/Edmonton'],
      19: ['America/Los_Angeles', 'America/Vancouver'],
      20: ['America/Anchorage', 'Pacific/Honolulu'],
      21: ['Pacific/Auckland', 'Pacific/Fiji'],
      22: ['Asia/Kamchatka', 'Pacific/Majuro'],
      23: ['Asia/Vladivostok', 'Asia/Magadan'],
    };

    // Get timezones for current hour
    const currentTimezones = timezoneGroups[currentHour] || [];
    
    if (currentTimezones.length === 0) {
      console.log(`⚠️ No timezones configured for UTC hour ${currentHour}`);
      return;
    }

    console.log(`🌍 Processing timezones: ${currentTimezones.join(', ')}`);

    let totalProcessed = 0;
    let totalReminders = 0;

    // Process each timezone in the current group
    for (const timezone of currentTimezones) {
      try {
        console.log(`\n🕐 Processing timezone: ${timezone}`);
        
        // Get users in this timezone
        const allUsers = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            timezone: true, // Include timezone field
          },
        });
        
        // Filter users by timezone
        const users = allUsers.filter(user => user.timezone === timezone);
        
        console.log(`👥 Found ${users.length} users in timezone ${timezone}`);

        if (users.length === 0) {
          console.log(`   ⏭️  No users in timezone ${timezone}`);
          continue;
        }

        // Get current date in this timezone
        const timezoneDate = new Date().toLocaleString('en-US', { timeZone: timezone });
        const localDate = new Date(timezoneDate);
        
        // Calculate "today" boundaries in this timezone
        const todayStart = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
        const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        
        console.log(`   📅 Local date in ${timezone}: ${localDate.toLocaleDateString()}`);
        console.log(`   🌅 Today start (local): ${todayStart.toISOString()}`);
        console.log(`   🌅 Tomorrow start (local): ${tomorrowStart.toISOString()}`);

        // Find reminders for today in this timezone
        const userIds = users.map(u => u.id);
        const todaysReminders = await prisma.reminder.findMany({
          where: {
            userId: { in: userIds },
            reminderDate: {
              gte: todayStart,
              lt: tomorrowStart,
            },
          },
          include: { user: true, course: true },
        });

        console.log(`   📋 Found ${todaysReminders.length} reminders for today in ${timezone}`);

        if (todaysReminders.length === 0) {
          console.log(`   ⏭️  No reminders to process for ${timezone}`);
          continue;
        }

        // Show what would be sent (without actually sending emails)
        for (const reminder of todaysReminders) {
          console.log(`   📧 Would send reminder to ${reminder.user.email} for course: ${reminder.course.name}`);
          if (reminder.message) {
            console.log(`      Message: ${reminder.message}`);
          }
        }

        totalReminders += todaysReminders.length;
        totalProcessed += users.length;

      } catch (timezoneError) {
        console.error(`❌ Error processing timezone ${timezone}:`, timezoneError);
      }
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`\n📊 Test completed:`);
    console.log(`   - Timezones processed: ${currentTimezones.length}`);
    console.log(`   - Users processed: ${totalProcessed}`);
    console.log(`   - Reminders found: ${totalReminders}`);
    console.log(`   - Processing time: ${processingTime}ms`);
    console.log(`\n💡 This was a dry run - no emails were actually sent!`);

  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCronLogic();
