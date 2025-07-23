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

// Create a course
export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = await getUserFromToken(token);

    if (!userPayload || !userPayload.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = userPayload.userId; // ✅ Strongly typed as string

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Course name is required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        name,
        userId,
      },
    });

    console.log("✅ Course created:", course);

    return NextResponse.json(
      { message: "Course created successfully", course },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error creating course:", err.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a course
export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userPayload = await getUserFromToken(token);

    if (!userPayload || !userPayload.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = userPayload.userId;

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ message: "Course Id is required" }, { status: 400 });
    }

    // 🛡 Check if course belongs to the user
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    if (course.userId !== userId) {
      return NextResponse.json({ message: "Unauthorized to delete this course" }, { status: 403 });
    }

    // ✅ Delete the course
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    console.log("✅ Course Deleted:", deletedCourse);

    return NextResponse.json(
      { message: "Course deleted successfully", deletedCourse },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error deleting course:", err.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Get all courses for the logged-in user
export async function GET(req: Request) {
  try {
    // 🛡 Extract token from cookies
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if (!token) {
      console.warn("⚠️ No token found in request cookies.");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔑 Decode and verify JWT
    const userPayload = await getUserFromToken(token);

    if (!userPayload || !userPayload.userId) {
      console.warn("⚠️ Invalid or missing userId in JWT payload.");
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = userPayload.userId;

    // 📦 Fetch all courses for this user
    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, // 👈 Optional: sort newest first
    });

    console.log(`✅ Found ${courses.length} courses for userId: ${userId}`);

    return NextResponse.json(
      { message: "Courses fetched successfully", courses },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error fetching courses:", err.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}