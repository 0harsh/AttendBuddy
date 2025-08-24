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


  // // Development mode bypass for local testing
  // const isDevelopment = process.env.NODE_ENV === 'development';
  
  // if (!isDevelopment) {
  //   const authHeader = request.headers.get('authorization');
  //   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //     return new Response('Unauthorized', { status: 401 });
  //   }
  // }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sets time to 00:00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const reminders = await prisma.reminder.findMany({
      where: {
        reminderDate: { gte: today, lt: tomorrow },
      },
      include: { user: true, course: true },
    });

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

    for (const userId in remindersByUser) {
      const { user, reminders } = remindersByUser[userId];
      
      try {
        // ✅ UPDATED: Create an HTML list that includes the custom message
        const classListHtml = reminders
          .map(r => 
            `<li>
               <strong>${r.course.name}</strong>
               ${r.message ? ` - <em>"${r.message}"</em>` : ''}
             </li>`
          )
          .join('');

        await resend.emails.send({
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
        
        sentCount++;

        const reminderIdsForThisUser = reminders.map(r => r.id);
        const deleteResult = await prisma.reminder.deleteMany({
          where: {
            id: { in: reminderIdsForThisUser },
          },
        });
        deletedCount += deleteResult.count;

      } catch (emailError) {
        console.error(`Failed to send email to user ${user.id}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers: Object.keys(remindersByUser).length,
      sentEmails: sentCount,
      deletedReminders: deletedCount,
    });
    
  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders.' },
      { status: 500 }
    );
  }
}
