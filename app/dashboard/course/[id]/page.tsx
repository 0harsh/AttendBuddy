"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Attendance = {
  id: string;
  date: string;
  status: "Present" | "Absent";
};

export default function CourseDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const name = searchParams.get("name");

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Fetch attendance
  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch(`/api/attendance?courseId=${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch attendance");

        const data = await res.json();
        console.log("✅ Attendance fetched:", data.attendances);
        setAttendance(data.attendances);
      } catch (err: any) {
        console.error("❌ Error fetching attendance:", err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAttendance();
  }, [id]);

  // When user clicks a date
  function handleDateClick(date: Date) {
    setSelectedDate(date);
    setShowMenu(true); // Open the choice menu
  }

  // Add or update attendance
  async function markAttendance(status: "Present" | "Absent") {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          date: selectedDate,
          status,
        }),
      });

      if (!res.ok) throw new Error("Failed to update attendance");

      const updated = await res.json();
      console.log("✅ Attendance updated:", updated);

      // Update local state
      setAttendance((prev) => {
        const filtered = prev.filter(
          (a) =>
            new Date(a.date).toDateString() !==
            new Date(selectedDate!).toDateString()
        );
        return [...filtered, updated.attendance];
      });
    } catch (err: any) {
      console.error("❌ Error updating attendance:", err.message);
    } finally {
      setShowMenu(false);
    }
  }

  // Delete attendance
  async function deleteAttendance() {
    try {
      const res = await fetch(
        `/api/attendance?courseId=${id}&date=${selectedDate?.toISOString()}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete attendance");

      console.log("✅ Attendance deleted");

      // Remove from state
      setAttendance((prev) =>
        prev.filter(
          (a) =>
            new Date(a.date).toDateString() !==
            new Date(selectedDate!).toDateString()
        )
      );
    } catch (err: any) {
      console.error("❌ Error deleting attendance:", err.message);
    } finally {
      setShowMenu(false);
    }
  }

  // Highlight Present/Absent days
  function tileContent({ date }: { date: Date }) {
    const record = attendance.find(
      (a) => new Date(a.date).toDateString() === date.toDateString()
    );

    if (record) {
      return (
        <div
          className={`h-2 w-2 rounded-full mx-auto mt-1 ${
            record.status === "Present" ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
      );
    }
    return null;
  }

  if (loading) {
    return <p className="text-center text-gray-500">Loading attendance...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{name ?? "Course"}</h1>
      <p className="text-gray-600 mb-6">
        Manage attendance for <strong>{name ?? "this course"}</strong>. Click a
        date to mark Present, Absent, or remove.
      </p>

      <div className="w-full max-w-xl mx-auto">
        <Calendar
          onClickDay={handleDateClick}
          tileContent={tileContent}
          value={selectedDate}
        />
      </div>

      {/* Menu for Present/Absent/Remove */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg space-y-2 text-center">
            <h2 className="text-lg font-semibold">
              Mark attendance for{" "}
              {selectedDate?.toLocaleDateString("en-IN")}
            </h2>
            <button
              onClick={() => markAttendance("Present")}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Mark Present
            </button>
            <button
              onClick={() => markAttendance("Absent")}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            >
              Mark Absent
            </button>
            <button
              onClick={deleteAttendance}
              className="w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
            >
              Remove Attendance
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="w-full bg-white border hover:bg-gray-100 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
