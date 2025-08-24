import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Attendance, Reminder } from "../types/attendance";

interface AttendanceCalendarProps {
  attendance: Attendance[];
  reminders: Reminder[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

export default function AttendanceCalendar({
  attendance,
  reminders,
  selectedDate,
  onDateClick,
}: AttendanceCalendarProps) {
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

  return (
    <div className="flex justify-center mb-8 animate-slide-up">
      <div className="card-modern p-6">
        <Calendar
          onClickDay={onDateClick}
          tileContent={tileContent}
          value={selectedDate}
          className="rounded-xl border-0 shadow-none"
        />
      </div>
    </div>
  );
}
