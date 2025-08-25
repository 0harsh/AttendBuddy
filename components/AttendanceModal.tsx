

interface AttendanceModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  isFutureDate: boolean;
  isAttendanceMarked: boolean;
  reminderExists: boolean;
  userTimezone?: string;
  onMarkAttendance: (status: "Present" | "Absent") => void;
  onDeleteAttendance: () => void;
  onSetReminder: () => void;
  onRemoveReminder: () => void;
  onClose: () => void;
}

export default function AttendanceModal({
  isOpen,
  selectedDate,
  isFutureDate,
  isAttendanceMarked,
  reminderExists,
  userTimezone,
  onMarkAttendance,
  onDeleteAttendance,
  onSetReminder,
  onRemoveReminder,
  onClose,
}: AttendanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="card-modern p-6 w-full max-w-sm mx-4 animate-bounce-in">
        <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <span className="text-blue-600">
            {selectedDate?.toLocaleDateString("en-IN")}
          </span>
        </h2>
        
        {/* Timezone Context */}
        {userTimezone && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center text-sm text-blue-800">
              <span className="font-medium">🌍 Timezone:</span> {userTimezone.split('/').pop()?.replace('_', ' ')}
            </div>
            <div className="text-center text-xs text-blue-600 mt-1">
              All dates are processed in your local timezone
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {!isFutureDate && !isAttendanceMarked && (
            <button
              onClick={() => onMarkAttendance("Present")}
              className="btn-success w-full"
            >
              ✅ Mark Present
            </button>
          )}
          {!isFutureDate && !isAttendanceMarked && (
            <button
              onClick={() => onMarkAttendance("Absent")}
              className="btn-danger w-full"
            >
              ❌ Mark Absent
            </button>
          )}
          {isAttendanceMarked && (
            <button
              onClick={onDeleteAttendance}
              className="btn-secondary w-full"
            >
              🗑️ Remove Attendance
            </button>
          )}
          {/* Set Reminder button for future dates only */}
          {isFutureDate && !reminderExists && (
            <button
              onClick={onSetReminder}
              className="btn-primary w-full"
            >
              ⏰ Set Reminder
            </button>
          )}
          {/* Remove Reminder if exists */}
          {reminderExists && (
            <button
              onClick={onRemoveReminder}
              className="btn-secondary w-full"
            >
              🗑️ Remove Reminder
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
