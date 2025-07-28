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
type Reminder = {
  id: string;
  reminderDate: string;
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
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState("");
  const [reminderError, setReminderError] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);

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

  // Fetch reminders
  useEffect(() => {
    async function fetchReminders() {
      try {
        const res = await fetch(`/api/reminders?courseId=${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch reminders");
        const data = await res.json();
        setReminders(data.reminders || []);
      } catch (err: any) {
        console.error("❌ Error fetching reminders:", err.message);
      }
    }
    if (id) fetchReminders();
  }, [id]);

  // When user clicks a date
  function handleDateClick(date: Date) {
    setSelectedDate(date);
    setShowMenu(true);
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

  // Helper to check if date is in the future
  function isFutureDate(date: Date | null) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  }

  async function handleSetReminder() {
    setReminderLoading(true);
    setReminderError("");
    setReminderSuccess("");
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          reminderDate: selectedDate,
          message: reminderMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set reminder");
      setReminderSuccess("Reminder set successfully!");
      setReminderMessage("");
      setShowReminderModal(false);
    } catch (err: any) {
      setReminderError(err.message);
    } finally {
      setReminderLoading(false);
    }
  }

  // Highlight Present/Absent/Reminder days
  function tileContent({ date }: { date: Date }) {
    const record = attendance.find(
      (a) => new Date(a.date).toDateString() === date.toDateString()
    );
    const reminder = reminders.find(
      (r) => new Date(r.reminderDate).toDateString() === date.toDateString()
    );

    if (record) {
      return (
        <div
          className={`h-3 w-3 rounded-full mx-auto mt-1 shadow-sm ${
            record.status === "Present" ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
      );
    }
    if (reminder) {
      return (
        <div className="h-3 w-3 rounded-full mx-auto mt-1 bg-blue-500 shadow-sm"></div>
      );
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-white text-lg">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {name ?? "Course"}
          </h1>
          <p className="text-white/80 text-lg">
            Click a date to mark attendance or set reminders
          </p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 text-white/90">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-sm font-medium">Present</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-sm font-medium">Absent</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
            <span className="text-sm font-medium">Reminder</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex justify-center mb-8 animate-slide-up">
          <div className="card-modern p-6">
            <Calendar
              onClickDay={handleDateClick}
              tileContent={tileContent}
              value={selectedDate}
              className="rounded-xl border-0 shadow-none"
            />
          </div>
        </div>

        {/* Attendance Modal */}
        {showMenu && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="card-modern p-6 w-full max-w-sm mx-4 animate-bounce-in">
              <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mark attendance for{" "}
                <span className="text-blue-600">
                  {selectedDate?.toLocaleDateString("en-IN")}
                </span>
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => markAttendance("Present")}
                  className="btn-success w-full"
                >
                  ✅ Mark Present
                </button>
                <button
                  onClick={() => markAttendance("Absent")}
                  className="btn-danger w-full"
                >
                  ❌ Mark Absent
                </button>
                <button
                  onClick={deleteAttendance}
                  className="btn-secondary w-full"
                >
                  🗑️ Remove Attendance
                </button>
                {/* Set Reminder button for future dates only */}
                {isFutureDate(selectedDate) && (
                  <button
                    onClick={() => {
                      setShowReminderModal(true);
                      setShowMenu(false);
                    }}
                    className="btn-primary w-full"
                  >
                    ⏰ Set Reminder
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminderModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="card-modern p-6 w-full max-w-sm mx-4 animate-bounce-in">
              <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Set Reminder for{" "}
                <span className="text-blue-600">
                  {selectedDate?.toLocaleDateString("en-IN")}
                </span>
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Reminder message (optional)"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="input-modern"
                  maxLength={100}
                />
                {reminderError && (
                  <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                    {reminderError}
                  </div>
                )}
                {reminderSuccess && (
                  <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                    {reminderSuccess}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSetReminder}
                    className="btn-primary flex-1"
                    disabled={reminderLoading}
                  >
                    {reminderLoading ? "Setting..." : "Set Reminder"}
                  </button>
                  <button
                    onClick={() => {
                      setShowReminderModal(false);
                      setReminderMessage("");
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
