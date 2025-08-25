
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

    // Check for today's reminders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysReminders = await prisma.reminder.findMany({
      where: {
        reminderDate: { gte: today, lt: tomorrow },
      },
      include: { user: true, course: true },
    });

    return NextResponse.json({
      status: 'test-completed',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        reminderCount,
        userCount,
        courseCount,
        todaysRemindersCount: todaysReminders.length,
      },
      todaysReminders: todaysReminders.map(r => ({
        id: r.id,
        userId: r.userId,
        courseId: r.courseId,
        reminderDate: r.reminderDate,
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

