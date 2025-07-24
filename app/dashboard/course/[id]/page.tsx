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
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-center text-gray-500">Loading attendance...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-700 mb-1 text-center">{name ?? "Course"}</h1>
        <p className="text-gray-600 text-center mb-3 text-sm">
          Click a date to mark Present, Absent, or remove attendance.
        </p>
        {/* Legend */}
        <div className="flex gap-4 items-center justify-center mb-3">
          <span className="flex items-center gap-1 text-green-600 text-xs"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>Present</span>
          <span className="flex items-center gap-1 text-red-500 text-xs"><span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>Absent</span>
        </div>
        <div className="w-full flex justify-center">
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-0">
            <Calendar
              onClickDay={handleDateClick}
              tileContent={tileContent}
              value={selectedDate}
              className="rounded-md"
            />
          </div>
        </div>
        {/* Modal for Present/Absent/Remove */}
        {showMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-xs space-y-2 text-center">
              <h2 className="text-base font-semibold mb-2 text-blue-700">
                Mark attendance for <span>{selectedDate?.toLocaleDateString("en-IN")}</span>
              </h2>
              <button
                onClick={() => markAttendance("Present")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold text-sm transition"
              >
                Mark Present
              </button>
              <button
                onClick={() => markAttendance("Absent")}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold text-sm transition"
              >
                Mark Absent
              </button>
              <button
                onClick={deleteAttendance}
                className="w-full bg-gray-200 hover:bg-gray-300 text-black py-2 rounded font-semibold text-sm transition"
              >
                Remove Attendance
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full bg-white border hover:bg-gray-100 py-2 rounded font-semibold text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
