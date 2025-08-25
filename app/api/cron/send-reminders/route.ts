// File: app/api/cron/send-reminders/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

// Type for user with timezone field
type UserWithTimezone = {
  id: string;
  email: string;
  name: string;
  timezone: string;
};

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify this is a legitimate cron job request
async function verifyCronRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No Bearer token provided');
    return false;
  }

  const token = authHeader.substring(7);
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.log('❌ CRON_SECRET environment variable not set');
    return false;
  }

  if (token !== expectedSecret) {
    console.log('❌ Invalid CRON_SECRET token');
    return false;
  }

  console.log('✅ Cron job authentication successful');
  return true;
}

export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron job request
    if (!(await verifyCronRequest(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting reminder processing for current timezone group...');
    const startTime = Date.now();

    // Get current UTC time to determine which timezone group to process
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    console.log(`🔍 Cron job running at UTC hour: ${currentHour}`);
    console.log(`📅 Current UTC time: ${now.toISOString()}`);

    // Define timezone groups - each hour corresponds to specific timezones
    // This ensures users get emails at around 7 AM in their local timezone
    const timezoneGroups = {
      0: ['Pacific/Auckland', 'Pacific/Fiji'], // UTC+12, UTC+13 - 7 AM local time
      1: ['Asia/Kamchatka', 'Pacific/Majuro'], // UTC+12 - 7 AM local time
      2: ['Asia/Vladivostok', 'Asia/Magadan'], // UTC+11 - 7 AM local time
      3: ['Asia/Sakhalin', 'Asia/Ust-Nera'], // UTC+11 - 7 AM local time
      4: ['Asia/Tokyo', 'Asia/Seoul', 'Asia/Pyongyang'], // UTC+9 - 7 AM local time
      5: ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore'], // UTC+8 - 7 AM local time
      6: ['Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Jakarta'], // UTC+7 - 7 AM local time
      7: ['Asia/Almaty', 'Asia/Dhaka', 'Asia/Omsk'], // UTC+6 - 7 AM local time
      8: ['Asia/Kolkata', 'Asia/Colombo', 'Asia/Kathmandu'], // UTC+5:30, UTC+5 - 7 AM local time
      9: ['Asia/Tashkent', 'Asia/Yekaterinburg'], // UTC+5 - 7 AM local time
      10: ['Asia/Dubai', 'Asia/Baku', 'Asia/Tbilisi'], // UTC+4 - 7 AM local time
      11: ['Europe/Moscow', 'Europe/Volgograd'], // UTC+3 - 7 AM local time
      12: ['Europe/Athens', 'Europe/Bucharest', 'Europe/Helsinki'], // UTC+2 - 7 AM local time
      13: ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome'], // UTC+1 - 7 AM local time
      14: ['Europe/London', 'Europe/Dublin'], // UTC+0 - 7 AM local time
      15: ['America/Sao_Paulo', 'America/Argentina/Buenos_Aires'], // UTC-3 - 7 AM local time
      16: ['America/New_York', 'America/Toronto'], // UTC-5 - 7 AM local time
      17: ['America/Chicago', 'America/Mexico_City'], // UTC-6 - 7 AM local time
      18: ['America/Denver', 'America/Edmonton'], // UTC-7 - 7 AM local time
      19: ['America/Los_Angeles', 'America/Vancouver'], // UTC-8 - 7 AM local time
      20: ['America/Anchorage', 'Pacific/Honolulu'], // UTC-9, UTC-10 - 7 AM local time
      21: ['Pacific/Auckland', 'Pacific/Fiji'], // UTC+12, UTC+13 (next day) - 7 AM local time
      22: ['Asia/Kamchatka', 'Pacific/Majuro'], // UTC+12 (next day) - 7 AM local time
      23: ['Asia/Vladivostok', 'Asia/Magadan'], // UTC+11 (next day) - 7 AM local time
    };

    // Get timezones for current hour
    const currentTimezones = timezoneGroups[currentHour as keyof typeof timezoneGroups] || [];
    
    if (currentTimezones.length === 0) {
      console.log(`⚠️ No timezones configured for UTC hour ${currentHour}`);
      return NextResponse.json({ message: 'No timezones to process for this hour.' });
    }

    console.log(`🌍 Processing timezones: ${currentTimezones.join(', ')}`);

    let totalProcessed = 0;
    let totalSent = 0;
    let totalErrors = 0;

    // Process each timezone in the current group
    for (const timezone of currentTimezones) {
      try {
        console.log(`\n🕐 Processing timezone: ${timezone}`);
        
        // Get users in this specific timezone
        const allUsers = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            timezone: true,
          },
        }) as unknown as UserWithTimezone[];
        
        // Filter users by timezone
        const users = allUsers.filter((user) => user.timezone === timezone);

        console.log(`👥 Found ${users.length} users in timezone ${timezone}`);
        
        // Debug: Show user details for verification
        if (users.length > 0) {
          console.log(`   📋 Users in ${timezone}:`);
          users.forEach(user => {
            console.log(`      - ${user.name} (${user.email})`);
          });
        }

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

        // Group reminders by user for efficient email sending
        const remindersByUser = todaysReminders.reduce((acc, reminder) => {
          if (!acc[reminder.userId]) {
            acc[reminder.userId] = [];
          }
          acc[reminder.userId].push(reminder);
          return acc;
        }, {} as Record<string, typeof todaysReminders>);

        // Send emails to users in this timezone
        for (const [userId, userReminders] of Object.entries(remindersByUser)) {
          const user = users.find(u => u.id === userId);
          if (!user) continue;

          try {
            console.log(`   📧 Sending email to ${user.email} (${timezone}) for ${userReminders.length} reminders`);
            
            // Create email content
            const courseNames = [...new Set(userReminders.map(r => r.course.name))];
            const reminderCount = userReminders.length;
            
            const emailContent = `
              <h2>📚 Attendance Reminder</h2>
              <p>Hello ${user.name},</p>
              <p>You have <strong>${reminderCount} reminder${reminderCount > 1 ? 's' : ''}</strong> for today:</p>
              <ul>
                ${userReminders.map(reminder => `
                  <li>
                    <strong>${reminder.course.name}</strong>
                    ${reminder.message ? `- ${reminder.message}` : ''}
                  </li>
                `).join('')}
              </ul>
              <p>Don't forget to mark your attendance!</p>
              <p><small>Timezone: ${timezone}</small></p>
            `;

            // Send email
            const emailResult = await resend.emails.create({
              from: 'AttendBuddy <noreply@yourdomain.com>',
              to: user.email,
              subject: `📚 Attendance Reminder - ${courseNames.join(', ')}`,
              html: emailContent,
            });

            console.log(`   ✅ Email sent successfully to ${user.email} (ID: ${emailResult.data?.id || 'unknown'})`);
            totalSent++;

            // Delete the reminders after sending
            const reminderIds = userReminders.map(r => r.id);
            await prisma.reminder.deleteMany({
              where: { id: { in: reminderIds } },
            });

            console.log(`   🗑️  Deleted ${reminderIds.length} reminders for ${user.email}`);

          } catch (emailError) {
            console.error(`   ❌ Failed to send email to user ${user.id} (${user.email}):`, emailError);
            totalErrors++;
          }
        }

        totalProcessed += users.length;

      } catch (timezoneError) {
        console.error(`❌ Error processing timezone ${timezone}:`, timezoneError);
        totalErrors++;
      }
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`\n📊 Cron job completed:`);
    console.log(`   - Timezones processed: ${currentTimezones.length}`);
    console.log(`   - Users processed: ${totalProcessed}`);
    console.log(`   - Emails sent: ${totalSent}`);
    console.log(`   - Errors: ${totalErrors}`);
    console.log(`   - Processing time: ${processingTime}ms`);
    console.log(`\n🌍 Timezone-specific processing:`);
    console.log(`   - Only users from matching timezones were processed`);
    console.log(`   - Each timezone group runs at its appropriate UTC hour`);

    return NextResponse.json({
      success: true,
      timezonesProcessed: currentTimezones.length,
      usersProcessed: totalProcessed,
      emailsSent: totalSent,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
      utcHour: currentHour,
    });

  } catch (error) {
    console.error('❌ Cron Job Error:', error);
    
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process reminders.',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
