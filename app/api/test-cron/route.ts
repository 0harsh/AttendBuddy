// Test version of the cron API for local testing
// This route bypasses authentication and doesn't send actual emails

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Type for user with timezone field
type UserWithTimezone = {
  id: string;
  email: string;
  name: string;
  timezone: string;
};

// Type for simulation results
type SimulationResult = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  timezone: string;
  reminders: {
    courseName: string;
    message: string | null;
    reminderDate: Date;
  }[];
  emailContent: string;
  wouldSend: boolean;
};

// Helper function to get timezone offset in hours
function getTimezoneOffset(timezone: string): number {
  const offsets: Record<string, number> = {
    'Asia/Kolkata': 5.5,      // UTC+5:30
    'Asia/Colombo': 5.5,      // UTC+5:30
    'Asia/Kathmandu': 5.75,   // UTC+5:45
    'Asia/Tashkent': 5,       // UTC+5
    'Asia/Dubai': 4,          // UTC+4
    'Europe/Moscow': 3,       // UTC+3
    'Europe/Athens': 2,       // UTC+2
    'Europe/Berlin': 1,       // UTC+1
    'Europe/Paris': 1,        // UTC+1
    'Europe/Rome': 1,         // UTC+1
    'Europe/London': 0,       // UTC+0
    'Europe/Dublin': 0,       // UTC+0
    'America/Sao_Paulo': -3,  // UTC-3
    'America/New_York': -5,   // UTC-5
    'America/Toronto': -5,    // UTC-5
    'America/Chicago': -6,    // UTC-6
    'America/Mexico_City': -6, // UTC-6
    'America/Denver': -7,     // UTC-7
    'America/Edmonton': -7,   // UTC-7
    'America/Anchorage': -9,  // UTC-9
    'America/Los_Angeles': -8, // UTC-8
    'America/Vancouver': -8,  // UTC-8
    'Pacific/Honolulu': -10,  // UTC-10
    'Pacific/Auckland': 12,   // UTC+12
    'Pacific/Fiji': 13,       // UTC+13
    'Asia/Kamchatka': 12,     // UTC+12
    'Pacific/Majuro': 12,     // UTC+12
    'Asia/Vladivostok': 11,   // UTC+11
    'Asia/Magadan': 11,       // UTC+11
    'Asia/Sakhalin': 11,      // UTC+11
    'Asia/Ust-Nera': 11,      // UTC+11
    'Asia/Tokyo': 9,          // UTC+9
    'Asia/Seoul': 9,          // UTC+9
    'Asia/Pyongyang': 9,      // UTC+9
    'Asia/Shanghai': 8,       // UTC+8
    'Asia/Hong_Kong': 8,      // UTC+8
    'Asia/Singapore': 8,      // UTC+8
    'Asia/Bangkok': 7,        // UTC+7
    'Asia/Ho_Chi_Minh': 7,    // UTC+7
    'Asia/Jakarta': 7,        // UTC+7
    'Asia/Almaty': 6,         // UTC+6
    'Asia/Dhaka': 6,          // UTC+6
    'Asia/Omsk': 6,           // UTC+6
  };
  
  return offsets[timezone] || 0;
}

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Check if this is a debug mode request
    const url = new URL(request.url);
    const debugMode = url.searchParams.get('debug') === 'true';
    
    console.log(`🧪 TEST MODE: Starting reminder processing simulation... ${debugMode ? '(DEBUG MODE - ALL TIMEZONES)' : ''}`);
    const startTime = Date.now();

    // Get current UTC time to determine which timezone group to process
    const now = new Date();
    //const currentHour = now.getUTCHours();  //change this to test
    const currentHour = 19;
    //currentHour = 19;
    
    console.log(`🔍 Test running at UTC hour: ${currentHour}`);
    console.log(`📅 Current UTC time: ${now.toISOString()}`);

    // Define timezone groups - each hour corresponds to specific timezones
    const timezoneGroups = {
      0: ['Pacific/Auckland', 'Pacific/Fiji'],
      1: ['Asia/Kamchatka', 'Pacific/Majuro'],
      2: ['Asia/Vladivostok', 'Asia/Magadan'],
      3: ['Asia/Sakhalin', 'Asia/Ust-Nera'],
      4: ['Asia/Tokyo', 'Asia/Seoul', 'Asia/Pyongyang'],
      5: ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore'],
      6: ['Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Jakarta'],
      7: ['Asia/Almaty', 'Asia/Dhaka', 'Asia/Omsk'],
      8: ['Asia/Tashkent', 'Asia/Yekaterinburg'],
      9: ['Asia/Dubai', 'Asia/Baku', 'Asia/Tbilisi'],
      10: ['Europe/Moscow', 'Europe/Volgograd'],
      11: ['Europe/Athens', 'Europe/Bucharest', 'Europe/Helsinki'],
      12: ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome'],
      13: ['Europe/London', 'Europe/Dublin'],
      14: ['America/Sao_Paulo', 'America/Argentina/Buenos_Aires'],
      15: ['America/New_York', 'America/Toronto'],
      16: ['America/Chicago', 'America/Mexico_City'],
      17: ['America/Denver', 'America/Edmonton'],
      18: ['America/Anchorage', 'Pacific/Honolulu'],
      19: ['Asia/Kolkata', 'Asia/Colombo', 'Asia/Kathmandu'], // Indian timezones at UTC hour 19
      20: ['America/Los_Angeles', 'America/Vancouver'],
      21: ['Pacific/Auckland', 'Pacific/Fiji'],
      22: ['Asia/Kamchatka', 'Pacific/Majuro'],
      23: ['Asia/Vladivostok', 'Asia/Magadan'],
    };

    // Get timezones for current hour (or all timezones in debug mode)
    let currentTimezones: string[] = [];
    
    if (debugMode) {
      // Debug mode: process all timezones
      currentTimezones = Object.values(timezoneGroups).flat();
      console.log(`🔧 DEBUG MODE: Processing ALL timezones (${currentTimezones.length} total)`);
    } else {
      // Normal mode: process only current hour timezones
      currentTimezones = timezoneGroups[currentHour as keyof typeof timezoneGroups] || [];
      
      if (currentTimezones.length === 0) {
        console.log(`⚠️ No timezones configured for UTC hour ${currentHour}`);
        return NextResponse.json({ message: 'No timezones to process for this hour.' });
      }
      
      console.log(`🌍 Processing timezones: ${currentTimezones.join(', ')}`);
    }

    let totalProcessed = 0;
    let totalReminders = 0;
    let totalErrors = 0;
    const simulationResults: SimulationResult[] = [];

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
        
        // Debug: Show all users and their timezones for troubleshooting
        console.log(`   🔍 All users in database:`);
        allUsers.forEach((user) => {
          console.log(`      - ${user.name} (${user.email}): timezone="${user.timezone}"`);
          console.log(`        Raw user object:`, JSON.stringify(user, null, 2));
        });
        
        // Filter users by timezone
        const users = allUsers.filter((user) => {
          console.log(`      🔍 Checking ${user.name}:`);
          console.log(`        - user.timezone exists: ${user.hasOwnProperty('timezone')}`);
          console.log(`        - user.timezone value: "${user.timezone}"`);
          console.log(`        - user.timezone type: ${typeof user.timezone}`);
          
          const userTimezone = user.timezone?.trim();
          const targetTimezone = timezone.trim();
          const matches = userTimezone === targetTimezone;
          console.log(`        - Final comparison: "${userTimezone}" === "${targetTimezone}" = ${matches}`);
          return matches;
        });

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

        // Calculate UTC boundaries for this timezone using currentHour and offset
        const timezoneOffset = getTimezoneOffset(timezone);
        
        // Use currentHour to determine the date boundaries
        // currentHour = 19 means we're at UTC hour 19, so we need to calculate boundaries
        // for the timezone's local day at that UTC time
        const todayStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0) - (timezoneOffset * 60 * 60 * 1000) + 24 * 60 * 60 * 1000);
        const tomorrowStartUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);
        
        console.log(`   🌍 UTC boundaries for ${timezone} (UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}):`);
        console.log(`   🌅 Today start (UTC): ${todayStartUTC.toISOString()}`);
        console.log(`   🌅 Tomorrow start (UTC): ${tomorrowStartUTC.toISOString()}`);

        // Find reminders for today in this timezone using UTC boundaries
        const userIds = users.map(u => u.id);
        const todaysReminders = await prisma.reminder.findMany({
          where: {
            userId: { in: userIds },
            reminderDate: {
              gte: todayStartUTC,      // UTC boundary
              lt: tomorrowStartUTC,    // UTC boundary
            },
          },
          include: { user: true, course: true },
        });

        console.log(`   📋 Found ${todaysReminders.length} reminders for today in ${timezone}`);

        if (todaysReminders.length === 0) {
          console.log(`   ⏭️  No reminders to process for ${timezone}`);
          continue;
        }

        // Group reminders by user for simulation
        const remindersByUser = todaysReminders.reduce((acc, reminder) => {
          if (!acc[reminder.userId]) {
            acc[reminder.userId] = [];
          }
          acc[reminder.userId].push(reminder);
          return acc;
        }, {} as Record<string, typeof todaysReminders>);

        // Simulate email sending to users in this timezone
        for (const [userId, userReminders] of Object.entries(remindersByUser)) {
          const user = users.find(u => u.id === userId);
          if (!user) continue;

          try {
            console.log(`   📧 SIMULATION: Would send email to ${user.email} (${timezone}) for ${userReminders.length} reminders`);
            
            // Create email content (for simulation)
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

            // Log what would be sent (simulation only)
            console.log(`   ✅ SIMULATION: Email would be sent successfully to ${user.email}`);
            console.log(`      Subject: 📚 Attendance Reminder - ${courseNames.join(', ')}`);
            console.log(`      Content length: ${emailContent.length} characters`);

            // Store simulation result
            simulationResults.push({
              user: {
                id: user.id,
                email: user.email,
                name: user.name
              },
              timezone,
              reminders: userReminders.map(r => ({
                courseName: r.course.name,
                message: r.message,
                reminderDate: r.reminderDate
              })),
              emailContent: emailContent,
              wouldSend: true
            });

            totalReminders += userReminders.length;

            // Note: In test mode, we don't delete reminders
            console.log(`   💡 SIMULATION: Would delete ${userReminders.length} reminders for ${user.email} (but keeping them for testing)`);

          } catch (emailError) {
            console.error(`   ❌ Failed to simulate email for user ${user.id} (${user.email}):`, emailError);
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

    console.log(`\n📊 Test simulation completed:`);
    console.log(`   - Timezones processed: ${currentTimezones.length}`);
    console.log(`   - Users processed: ${totalProcessed}`);
    console.log(`   - Reminders found: ${totalReminders}`);
    console.log(`   - Errors: ${totalErrors}`);
    console.log(`   - Processing time: ${processingTime}ms`);
    console.log(`\n🌍 Timezone-specific processing:`);
    console.log(`   - Only users from matching timezones were processed`);
    console.log(`   - Each timezone group runs at its appropriate UTC hour`);
    console.log(`\n⏰ Current UTC Hour: ${currentHour}`);
    console.log(`   - Active timezone groups: ${currentTimezones.join(', ')}`);
    console.log(`   - Europe/Paris belongs to UTC Hour 13 (UTC+1)`);
    console.log(`   - If current hour is not 13, Europe/Paris users won't be processed`);
    console.log(`\n💡 This was a simulation - no emails were actually sent!`);

    return NextResponse.json({
      success: true,
      mode: debugMode ? 'debug-simulation' : 'simulation',
      timezonesProcessed: currentTimezones.length,
      usersProcessed: totalProcessed,
      remindersFound: totalReminders,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
      utcHour: currentHour,
      simulationResults,
      debugMode,
      note: debugMode 
        ? 'This was a DEBUG simulation processing ALL timezones. No emails were sent and no reminders were deleted.'
        : 'This was a test simulation. No emails were sent and no reminders were deleted.'
    });

  } catch (error) {
    console.error('❌ Test Cron Job Error:', error);
    
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process test reminders.',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
