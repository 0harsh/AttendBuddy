"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Attendance = {
  id: string;
  date: string;
  status: "Present" | "Absent";
};

type CourseDetailsProps = {
  courseId: string;
};

export default function CourseDetails({ courseId }: CourseDetailsProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch existing attendance for this course
  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch(`/api/attendance?courseId=${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        console.log("✅ Attendance fetched:", data.attendances);
        setAttendance(data.attendances);
      } catch (err: any) {
        console.error("❌ Error fetching attendance:", err.message);
      }
    }
    if (courseId) fetchAttendance();
  }, [courseId]);

  // Toggle attendance status
  async function handleDateClick(date: Date) {
    setSelectedDate(date);

    const existing = attendance.find(
      (a) => new Date(a.date).toDateString() === date.toDateString()
    );

    const newStatus = existing?.status === "Present" ? "Absent" : "Present";

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          date,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update attendance");

      const updated = await res.json();
      console.log("✅ Attendance updated:", updated);

      // Update state
      setAttendance((prev) => {
        const other = prev.filter(
          (a) => new Date(a.date).toDateString() !== date.toDateString()
        );
        return [...other, updated.attendance];
      });
    } catch (err: any) {
      console.error("❌ Error updating attendance:", err.message);
    }
  }

  // Render day tiles with attendance color
  function tileClassName({ date }: { date: Date }) {
    const record = attendance.find(
      (a) => new Date(a.date).toDateString() === date.toDateString()
    );
    if (record?.status === "Present") return "bg-green-200";
    if (record?.status === "Absent") return "bg-red-200";
    return "";
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        value={selectedDate}
      />
      <p className="mt-4 text-gray-500">
        Click on a date to toggle Present/Absent
      </p>
    </div>
  );
}
