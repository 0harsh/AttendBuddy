
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      CRON_SECRET: !!process.env.CRON_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check database connection
    let dbStatus = 'unknown';
    try {
      await prisma.$connect();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'failed';
      console.error('Database connection failed:', error);
    }

    // Check if there are any reminders in the database
    const reminderCount = await prisma.reminder.count();
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();

    // Check for today's reminders using the same logic as the cron job
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log(`🔍 Debug: Current time: ${now.toISOString()}`);
    console.log(`🔍 Debug: Today start: ${today.toISOString()}`);
    console.log(`🔍 Debug: Tomorrow start: ${tomorrow.toISOString()}`);

    // Get reminders that fall within today's range
    const todaysReminders = await prisma.reminder.findMany({
      where: {
        reminderDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: { user: true, course: true },
    });

    // Also get all reminders for comparison
    const allReminders = await prisma.reminder.findMany({
      include: { user: true, course: true },
    });

    // Log first few reminders to see their date format
    if (allReminders.length > 0) {
      console.log('🔍 Debug: Sample reminder dates:');
      allReminders.slice(0, 3).forEach((r, i) => {
        const reminderDate = new Date(r.reminderDate);
        console.log(`  Reminder ${i + 1}: ${r.course.name} - Original: ${r.reminderDate}, Parsed: ${reminderDate.toISOString()}`);
      });
    }

    return NextResponse.json({
      status: 'test-completed',
      timestamp: new Date().toISOString(),
      serverTime: now.toISOString(),
      todayStart: today.toISOString(),
      tomorrowStart: tomorrow.toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        reminderCount,
        userCount,
        courseCount,
        totalReminders: allReminders.length,
        todaysRemindersCount: todaysReminders.length,
      },
      allReminders: allReminders.map(r => ({
        id: r.id,
        userId: r.userId,
        courseId: r.courseId,
        reminderDate: r.reminderDate,
        reminderDateISO: new Date(r.reminderDate).toISOString(),
        message: r.message,
        userEmail: r.user.email,
        userName: r.user.name,
        courseName: r.course.name,
      })),
      todaysReminders: todaysReminders.map(r => ({
        id: r.id,
        userId: r.userId,
        courseId: r.courseId,
        reminderDate: r.reminderDate,
        reminderDateISO: new Date(r.reminderDate).toISOString(),
        message: r.message,
        userEmail: r.user.email,
        userName: r.user.name,
        courseName: r.course.name,
      })),
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

