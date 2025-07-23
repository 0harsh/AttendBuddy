import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

type JWTPayload = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

async function getUserFromToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (err) {
    console.error("❌ Invalid JWT token:", err);
    return null;
  }
}

// ✅ Create or Update Attendance
export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = await getUserFromToken(token);
    if (!userPayload?.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { courseId, date, status } = await req.json();

    if (!courseId || !date || !status) {
      return NextResponse.json(
        { message: "courseId, date, and status are required" },
        { status: 400 }
      );
    }

    const userId = userPayload.userId;

    // ✅ Create or update attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_courseId_date: {
          userId,
          courseId,
          date: new Date(date),
        },
      },
      create: {
        userId,
        courseId,
        date: new Date(date),
        status,
      },
      update: {
        status,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Attendance marked:", attendance);

    return NextResponse.json(
      { message: "Attendance updated successfully", attendance },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error in POST /api/attendance:", err.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Fetch Attendance for a Course
export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = await getUserFromToken(token);
    if (!userPayload?.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { message: "courseId is required in query params" },
        { status: 400 }
      );
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: userPayload.userId,
        courseId,
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log(`✅ Found ${attendances.length} attendances`);

    return NextResponse.json(
      { message: "Attendances fetched successfully", attendances },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error in GET /api/attendance:", err.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// ✅ Delete Attendance for a Course
export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = await getUserFromToken(token);
    if (!userPayload?.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const date = searchParams.get("date");

    if (!courseId || !date) {
      return NextResponse.json(
        { message: "courseId and date are required in query params" },
        { status: 400 }
      );
    }

    const userId = userPayload.userId;

    const deleted = await prisma.attendance.deleteMany({
      where: {
        userId,
        courseId,
        date: new Date(date),
      },
    });

    console.log(`✅ Deleted attendance for ${date}:`, deleted);

    return NextResponse.json(
      { message: "Attendance deleted successfully", deletedCount: deleted.count },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error in DELETE /api/attendance:", err.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}