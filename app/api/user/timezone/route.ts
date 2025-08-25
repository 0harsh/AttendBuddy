
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

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { timezone } = body;

    if (!timezone) {
      return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
    }

    // Validate timezone format
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid timezone format' }, { status: 400 });
    }

    // Update user timezone
    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: { timezone },
    });

    return NextResponse.json({
      message: 'Timezone updated successfully',
      timezone: updatedUser.timezone,
    });

  } catch (error) {
    console.error('Update timezone error:', error);
    return NextResponse.json(
      { error: 'Failed to update timezone' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
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

    // Get user timezone
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { timezone: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      timezone: user.timezone,
    });

  } catch (error) {
    console.error('Get timezone error:', error);
    return NextResponse.json(
      { error: 'Failed to get timezone' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

