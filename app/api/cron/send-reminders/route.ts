// File: app/api/cron/send-reminders/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient, User, Course, Reminder } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

type GroupedReminders = {
  [userId: string]: {
    user: User;
    reminders: (Reminder & { course: Course })[];
  };
};

export async function GET(request: NextRequest) {
  // Production authentication check
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron job access attempt');
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sets time to 00:00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log(`🔍 Looking for reminders between ${today.toISOString()} and ${tomorrow.toISOString()}`);

    const reminders = await prisma.reminder.findMany({
      where: {
        reminderDate: { gte: today, lt: tomorrow },
      },
      include: { user: true, course: true },
    });

    console.log(`📅 Found ${reminders.length} reminders for today`);

    if (reminders.length === 0) {
      return NextResponse.json({ message: 'No reminders to send today.' });
    }

    const remindersByUser = reminders.reduce<GroupedReminders>((acc, r) => {
      if (!acc[r.userId]) {
        acc[r.userId] = { user: r.user, reminders: [] };
      }
      acc[r.userId].reminders.push(r);
      return acc;
    }, {});
    
    let sentCount = 0;
    let deletedCount = 0;
    let errorCount = 0;

    for (const userId in remindersByUser) {
      const { user, reminders } = remindersByUser[userId];
      
      try {
        console.log(`📧 Sending email to ${user.email} for ${reminders.length} reminders`);
        
        // Create an HTML list that includes the custom message
        const classListHtml = reminders
          .map(r => 
            `<li>
               <strong>${r.course.name}</strong>
               ${r.message ? ` - <em>"${r.message}"</em>` : ''}
             </li>`
          )
          .join('');

        // Resend API returns { data: { id: string }, error: null } on success
        const emailResult = await resend.emails.send({
          from: 'Class Reminders <onboarding@resend.dev>',
          to: [user.email],
          subject: `You have ${reminders.length} class(es) today!`,
          html: `
            <h1>Hi ${user.name},</h1>
            <p>Here is your schedule for today, ${today.toLocaleDateString()}:</p>
            <ul>${classListHtml}</ul>
            <p>Have a great day!</p>
          `,
        });
        
        console.log(`✅ Email sent successfully to ${user.email}:`, emailResult.data?.id || 'unknown');
        sentCount++;

        // Delete reminders after successful email send
        const reminderIdsForThisUser = reminders.map(r => r.id);
        const deleteResult = await prisma.reminder.deleteMany({
          where: {
            id: { in: reminderIdsForThisUser },
          },
        });
        deletedCount += deleteResult.count;
        console.log(`🗑️ Deleted ${deleteResult.count} reminders for user ${user.id}`);

      } catch (emailError) {
        errorCount++;
        console.error(`❌ Failed to send email to user ${user.id} (${user.email}):`, emailError);
        
        // Log specific error details
        if (emailError instanceof Error) {
          console.error(`Error details: ${emailError.message}`);
          console.error(`Error stack: ${emailError.stack}`);
        }
      }
    }

    console.log(`📊 Cron job completed: ${sentCount} emails sent, ${deletedCount} reminders deleted, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      processedUsers: Object.keys(remindersByUser).length,
      sentEmails: sentCount,
      deletedReminders: deletedCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Cron Job Error:', error);
    
    // Log specific error details
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
