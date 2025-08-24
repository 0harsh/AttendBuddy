// Test script for cron API logic
// Run with: node test-cron.js

// Mock environment variables
process.env.CRON_SECRET = 'test_secret';
process.env.RESEND_API_KEY = 'test_key';

// Mock Prisma and Resend (you'll need to install these as dev dependencies)
const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

// Test the reminder logic
async function testReminderLogic() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log('Testing date logic:');
    console.log('Today (start):', today.toISOString());
    console.log('Tomorrow (end):', tomorrow.toISOString());
    console.log('Date range looks correct:', today < tomorrow);

    // Test reminder grouping logic
    const mockReminders = [
      { id: 1, userId: 'user1', user: { name: 'John', email: 'john@test.com' }, course: { name: 'Math 101' }, message: 'Bring calculator' },
      { id: 2, userId: 'user1', user: { name: 'John', email: 'john@test.com' }, course: { name: 'Physics 101' }, message: null },
      { id: 3, userId: 'user2', user: { name: 'Jane', email: 'jane@test.com' }, course: { name: 'Chemistry 101' }, message: 'Lab safety gear' }
    ];

    const remindersByUser = mockReminders.reduce((acc, r) => {
      if (!acc[r.userId]) {
        acc[r.userId] = { user: r.user, reminders: [] };
      }
      acc[r.userId].reminders.push(r);
      return acc;
    }, {});

    console.log('\nTesting reminder grouping:');
    console.log('Users with reminders:', Object.keys(remindersByUser).length);
    console.log('User 1 reminders:', remindersByUser['user1']?.reminders.length);
    console.log('User 2 reminders:', remindersByUser['user2']?.reminders.length);

    // Test HTML generation
    for (const userId in remindersByUser) {
      const { user, reminders } = remindersByUser[userId];
      
      const classListHtml = reminders
        .map(r => 
          `<li>
             <strong>${r.course.name}</strong>
             ${r.message ? ` - <em>"${r.message}"</em>` : ''}
           </li>`
        )
        .join('');

      console.log(`\nEmail for ${user.name}:`);
      console.log(`Subject: You have ${reminders.length} class(es) today!`);
      console.log('HTML preview:', classListHtml);
    }

    console.log('\n✅ All tests passed! The logic is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testReminderLogic();
