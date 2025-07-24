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

        const userId = userPayload.userId;

        const { presents, absents } = await req.json();

        // presents, absents are arrays of course IDs for the selected user 
        // For today's date, mark presents and absents for the selected user
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight for uniqueness

        const results: { courseId: string; status: string; action: string }[] = [];

        // Helper to upsert attendance and update course counters
        async function upsertAttendance(courseId: string, status: "Present" | "Absent") {
          const existing = await prisma.attendance.findUnique({
            where: {
              userId_courseId_date: {
                userId,
                courseId,
                date: today,
              },
            },
          });
          let action;
          if (existing) {
            if (existing.status !== status) {
              await prisma.$transaction([
                prisma.attendance.update({
                  where: {
                    userId_courseId_date: {
                      userId,
                      courseId,
                      date: today,
                    },
                  },
                  data: { status, updatedAt: new Date() },
                }),
                prisma.course.update({
                  where: { id: courseId },
                  data: {
                    ...(status === "Present" && { presents: { increment: 1 } }),
                    ...(status === "Absent" && { absents: { increment: 1 } }),
                    ...(existing.status === "Present" && status !== "Present" && { presents: { decrement: 1 } }),
                    ...(existing.status === "Absent" && status !== "Absent" && { absents: { decrement: 1 } }),
                  },
                }),
              ]);
              action = "updated";
            } else {
              action = "unchanged";
            }
          } else {
            await prisma.$transaction([
              prisma.attendance.create({
                data: {
                  userId,
                  courseId,
                  date: today,
                  status,
                },
              }),
              prisma.course.update({
                where: { id: courseId },
                data: {
                  totalAttendance: { increment: 1 },
                  ...(status === "Present" && { presents: { increment: 1 } }),
                  ...(status === "Absent" && { absents: { increment: 1 } }),
                },
              }),
            ]);
            action = "created";
          }
          results.push({ courseId, status, action });
        }

        for (const present of presents) {
          await upsertAttendance(present, "Present");
        }
        for (const absent of absents) {
          await upsertAttendance(absent, "Absent");
        }

        return NextResponse.json({ message: "Quick attendance marked", results }, { status: 200 });
        
    } catch (error) {
        console.log("Error posting quick attendance", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}