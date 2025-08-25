// File: app/api/reminders/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUserFromToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch (err) {
    console.error('❌ Invalid JWT token:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract token from cookies
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userPayload = await getUserFromToken(token);
    if (!userPayload || !userPayload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = userPayload.userId;

    const body = await request.json();
    const { courseId, reminderDate, message } = body;
    console.log('Original Reminder Date:', reminderDate);

    if (!courseId || !reminderDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log("reminderDate--- ", reminderDate);

    // Store reminder date in UTC to avoid timezone issues
    const dateObj = new Date(reminderDate);

    console.log("dateObj--- ", dateObj);

    
    // The key insight: We need to create a date that represents midnight UTC
    // for the selected date, regardless of the user's timezone
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const date = dateObj.getDate();
    
    // Create a date at midnight UTC for the selected date
    const utcDate = dateObj;

    console.log("utcDate--- ", utcDate);
    
    console.log('=== TIMEZONE DEBUG ===');
    console.log('Received Reminder Date:', reminderDate);
    console.log('Parsed Date Object:', dateObj.toISOString());
    console.log('Local Date String:', dateObj.toLocaleDateString('en-IN'));
    console.log('Year/Month/Date:', `${year}/${month + 1}/${date}`);
    console.log('UTC Date for Storage:', utcDate.toISOString());
    console.log('UTC Date Timestamp:', utcDate.getTime());
    console.log('UTC Date Local Display:', utcDate.toString());
    console.log('====================================');

    // Check if reminder exists for this user, course, and date
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        userId,
        courseId,
        reminderDate: utcDate,
      },
    });

    let reminder;
    if (existingReminder) {
      // Update the message if already exists
      reminder = await prisma.reminder.update({
        where: { id: existingReminder.id },
        data: { message },
      });
    } else {
      // Create new reminder
      reminder = await prisma.reminder.create({
        data: {
          userId,
          courseId,
          reminderDate: utcDate,
          message, // This can be optional
        },
      });
    }

    return NextResponse.json({ 
      message: 'Reminder set successfully!', 
      reminder,
      dateInfo: {
        original: reminderDate,
        utcStored: utcDate.toISOString(),
        localDate: dateObj.toLocaleDateString('en-IN'),
      }
    }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') { // Prisma's unique constraint violation code
      return NextResponse.json({ error: 'A reminder for this class on this date already exists.' }, { status: 409 });
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Set Reminder Error:', errorMessage);
    return NextResponse.json({ error: 'Failed to set reminder.' }, { status: 500 });
  }
}

// GET: Return all reminders for a course for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userPayload = await getUserFromToken(token);
    if (!userPayload || !userPayload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = userPayload.userId;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        courseId,
      },
      orderBy: { reminderDate: 'asc' },
    });

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error('Get Reminders Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders.' }, { status: 500 });
  }
}