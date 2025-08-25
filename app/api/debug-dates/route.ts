// File: app/api/debug-dates/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    
    // Different ways to create "today"
    const today1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const today2 = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const today3 = new Date(now.toISOString().split('T')[0]);
    
    // Get a sample reminder to see its date format
    const sampleReminder = await prisma.reminder.findFirst({
      include: { user: true, course: true },
    });

    let reminderAnalysis = null;
    if (sampleReminder) {
      const reminderDate = new Date(sampleReminder.reminderDate);
      reminderAnalysis = {
        original: sampleReminder.reminderDate,
        parsed: reminderDate.toISOString(),
        localDate: reminderDate.toLocaleDateString(),
        utcDate: reminderDate.toUTCString(),
        year: reminderDate.getFullYear(),
        month: reminderDate.getMonth(),
        date: reminderDate.getDate(),
        hours: reminderDate.getHours(),
        minutes: reminderDate.getMinutes(),
        timezoneOffset: reminderDate.getTimezoneOffset(),
      };
    }

    // Test different date ranges
    const ranges = [
      {
        name: 'Local Today (00:00 to 23:59)',
        start: today1,
        end: new Date(today1.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
      {
        name: 'UTC Today (00:00 to 23:59)',
        start: today2,
        end: new Date(today2.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
      {
        name: 'String Today (00:00 to 23:59)',
        start: today3,
        end: new Date(today3.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
    ];

    const rangeResults = [];
    for (const range of ranges) {
      const count = await prisma.reminder.count({
        where: {
          reminderDate: {
            gte: range.start,
            lte: range.end,
          },
        },
      });
      
      rangeResults.push({
        name: range.name,
        start: range.start.toISOString(),
        end: range.end.toISOString(),
        count,
      });
    }

    return NextResponse.json({
      status: 'debug-completed',
      timestamp: now.toISOString(),
      currentTime: {
        now: now.toISOString(),
        local: now.toLocaleString(),
        utc: now.toUTCString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: now.getTimezoneOffset(),
      },
      todayDefinitions: {
        local: today1.toISOString(),
        utc: today2.toISOString(),
        string: today3.toISOString(),
      },
      sampleReminder: reminderAnalysis,
      rangeResults,
      totalReminders: await prisma.reminder.count(),
    });

  } catch (error) {
    console.error('Debug dates error:', error);
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
