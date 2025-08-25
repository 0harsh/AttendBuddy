"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CourseHeader from "../../../../components/CourseHeader";
import AttendanceLegend from "../../../../components/AttendanceLegend";
import AttendanceCalendar from "../../../../components/AttendanceCalendar";
import AttendanceModal from "../../../../components/AttendanceModal";
import ReminderModal from "../../../../components/ReminderModal";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { Attendance, Reminder } from "../../../../types/attendance";

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
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceMessageType, setAttendanceMessageType] = useState<"success" | "error">("success");
  const [userProfile, setUserProfile] = useState<{ timezone: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Fetch user profile for timezone
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    fetchUserProfile();
  }, []);

  // Update current time in user's timezone
  useEffect(() => {
    if (userProfile?.timezone) {
      const interval = setInterval(() => {
        const time = new Date().toLocaleString('en-US', { 
          timeZone: userProfile.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setCurrentTime(time);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [userProfile?.timezone]);

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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Error fetching attendance:", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAttendance();
  }, [id]);

  // Refresh attendance data
  async function refreshAttendance() {
    try {
      const res = await fetch(`/api/attendance?courseId=${id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendances);
      }
    } catch (err: unknown) {
      console.error("❌ Error refreshing attendance:", err);
    }
  }

  // Fetch reminders
  useEffect(() => {
    async function fetchReminders() {
      try {
        const res = await fetch(`/api/reminders?courseId=${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch reminders");
        const data = await res.json();
        setReminders(data.reminders || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Error fetching reminders:", errorMessage);
      }
    }
    if (id) fetchReminders();
  }, [id]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      setAttendanceMessage("");
      setReminderMessage("");
    };
  }, []);

  // When user clicks a date
  function handleDateClick(date: Date) {
    console.log("date you clicked on---", date);
    setSelectedDate(date);
    setShowMenu(true);
  }

  // Add or update attendance
  async function markAttendance(status: "Present" | "Absent") {
    if (!selectedDate) return;
    
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

      // Show success message
      setAttendanceMessage(`Marked ${status.toLowerCase()} for ${selectedDate.toLocaleDateString()}`);
      setAttendanceMessageType("success");
      setTimeout(() => setAttendanceMessage(""), 3000);

      // Update local state more robustly
      setAttendance((prev) => {
        const selectedDateString = selectedDate.toDateString();
        const filtered = prev.filter(
          (a) => new Date(a.date).toDateString() !== selectedDateString
        );
        return [...filtered, updated.attendance];
      });
      
      setShowMenu(false);
      refreshAttendance(); // Refresh attendance data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error updating attendance:", errorMessage);
      
      // Show error message
      setAttendanceMessage(`Failed to mark attendance: ${errorMessage}`);
      setAttendanceMessageType("error");
      setTimeout(() => setAttendanceMessage(""), 5000);
    }
  }

  // Delete attendance
  async function deleteAttendance() {
    if (!selectedDate) return;
    
    try {
      const res = await fetch(
        `/api/attendance?courseId=${id}&date=${selectedDate.toISOString()}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete attendance");

      console.log("✅ Attendance deleted");

      // Show success message
      setAttendanceMessage(`Removed attendance for ${selectedDate.toLocaleDateString()}`);
      setAttendanceMessageType("success");
      setTimeout(() => setAttendanceMessage(""), 3000);

      // Remove from state more robustly
      setAttendance((prev) => {
        const selectedDateString = selectedDate.toDateString();
        return prev.filter(
          (a) => new Date(a.date).toDateString() !== selectedDateString
        );
      });
      
      setShowMenu(false);
      refreshAttendance(); // Refresh attendance data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error deleting attendance:", errorMessage);
      
      // Show error message
      setAttendanceMessage(`Failed to delete attendance: ${errorMessage}`);
      setAttendanceMessageType("error");
      setTimeout(() => setAttendanceMessage(""), 5000);
    }
  }

  // Helper to check if date is in the future
  function isFutureDate(date: Date | null) {
    if (!date) return false;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    return date > today;
  }

  // check if attendance is already marked or not
  function isAttendanceMarked(date: Date | null) {
    if (!date) return false;
    
    // Normalize the selected date to start of day (midnight) in local timezone
    const selectedDateStart = new Date(date);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    return attendance.some((attendanceRecord) => {
      // Normalize the attendance date to start of day (midnight) in local timezone
      const attendanceDate = new Date(attendanceRecord.date);
      attendanceDate.setHours(0, 0, 0, 0);
      
      // Compare the normalized dates using timestamp comparison
      return attendanceDate.getTime() === selectedDateStart.getTime();
    });
  }

  // check if reminder exists for the selected date
  function isReminderExists(date: Date | null) {
    if (!date) return false;
    
    // Normalize the selected date to start of day (midnight) in local timezone
    const selectedDateStart = new Date(date);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    return reminders.some((reminder) => {
      // Normalize the reminder date to start of day (midnight) in local timezone
      const reminderDate = new Date(reminder.reminderDate);
      reminderDate.setHours(0, 0, 0, 0);
      
      // Compare the normalized dates using timestamp comparison
      return reminderDate.getTime() === selectedDateStart.getTime();
    });
  }

  async function handleSetReminder() {
    setReminderLoading(true);
    setReminderError("");
    setReminderSuccess("");
    try {
      if (!selectedDate) {
        throw new Error("No date selected");
      }

      console.log("selectedDate--- ", selectedDate);
      console.log("selectedDate--- ", selectedDate.toISOString());

      // Send the ISO string directly to the API
      const reminderDateISO = selectedDate.toISOString();
      
      console.log('=== CLIENT SIDE TIMEZONE DEBUG ===');
      console.log('Original selectedDate:', selectedDate.toISOString());
      console.log('Local Date String:', selectedDate.toLocaleDateString('en-IN'));
      console.log('ISO String for API:', reminderDateISO);
      console.log('==================================');

      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          reminderDate: reminderDateISO, // Send ISO string to API
          message: reminderMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set reminder");
      
      setReminderSuccess("Reminder set successfully!");
      setReminderMessage("");
      setShowReminderModal(false);
      
      // Refresh reminders list
      const refreshRes = await fetch(`/api/reminders?courseId=${id}`, { cache: "no-store" });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setReminders(refreshData.reminders || []);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setReminderError(errorMessage);
    } finally {
      setReminderLoading(false);
    }
  }

  // Remove reminder
  async function handleRemoveReminder() {
    if (!selectedDate) return;
    
    try {
      const res = await fetch(
        `/api/reminders?courseId=${id}&date=${selectedDate.toISOString()}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to remove reminder");

      console.log("✅ Reminder removed");

      // Show success message
      setAttendanceMessage(`Removed reminder for ${selectedDate.toLocaleDateString()}`);
      setAttendanceMessageType("success");
      setTimeout(() => setAttendanceMessage(""), 3000);

      // Refresh reminders list
      const refreshRes = await fetch(`/api/reminders?courseId=${id}`, { cache: "no-store" });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setReminders(refreshData.reminders || []);
      }
      
      setShowMenu(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Error removing reminder:", errorMessage);
      
      // Show error message
      setAttendanceMessage(`Failed to remove reminder: ${errorMessage}`);
      setAttendanceMessageType("error");
      setTimeout(() => setAttendanceMessage(""), 5000);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <CourseHeader courseName={name} />
        
        {/* Timezone Indicator */}
        {userProfile?.timezone && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <span className="text-lg">🌍</span>
              <span className="font-medium">Your Timezone:</span>
              <span className="font-mono">{userProfile.timezone.split('/').pop()?.replace('_', ' ')}</span>
              <span className="text-sm text-blue-600">({currentTime})</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Reminders will be sent based on your local timezone
            </p>
          </div>
        )}
        
        {/* Attendance Feedback Message */}
        {attendanceMessage && (
          <div className={`mb-4 p-3 rounded-lg text-center animate-fade-in ${
            attendanceMessageType === "success" 
              ? "bg-yellow-100 text-green-700 border border-green-200" 
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            {attendanceMessage}
          </div>
        )}
        
        <AttendanceLegend />
        
        <AttendanceCalendar
          attendance={attendance}
          reminders={reminders}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />

        <AttendanceModal
          isOpen={showMenu}
          selectedDate={selectedDate}
          isFutureDate={isFutureDate(selectedDate)}
          isAttendanceMarked={isAttendanceMarked(selectedDate)}
          reminderExists={isReminderExists(selectedDate)}
          userTimezone={userProfile?.timezone}
          onMarkAttendance={markAttendance}
          onDeleteAttendance={deleteAttendance}
          onSetReminder={() => {
            setShowReminderModal(true);
            setShowMenu(false);
          }}
          onClose={() => setShowMenu(false)}
          onRemoveReminder={handleRemoveReminder}
        />

        <ReminderModal
          isOpen={showReminderModal}
          selectedDate={selectedDate}
          reminderMessage={reminderMessage}
          reminderLoading={reminderLoading}
          reminderError={reminderError}
          reminderSuccess={reminderSuccess}
          userTimezone={userProfile?.timezone}
          onMessageChange={setReminderMessage}
          onSetReminder={handleSetReminder}
          onClose={() => {
            setShowReminderModal(false);
            setReminderMessage("");
          }}
        />
      </div>
    </div>
  );
}
