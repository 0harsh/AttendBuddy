interface ReminderModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  reminderMessage: string;
  reminderLoading: boolean;
  reminderError: string;
  reminderSuccess: string;
  onMessageChange: (message: string) => void;
  onSetReminder: () => void;
  onClose: () => void;
}

export default function ReminderModal({
  isOpen,
  selectedDate,
  reminderMessage,
  reminderLoading,
  reminderError,
  reminderSuccess,
  onMessageChange,
  onSetReminder,
  onClose,
}: ReminderModalProps) {
  if (!isOpen) return null;

  return (
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
            onChange={(e) => onMessageChange(e.target.value)}
            className="input-modern"
            maxLength={100}
          />

          
          {/* {reminderError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {reminderError}
            </div>
          )}
          {reminderSuccess && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
              {reminderSuccess}
            </div>
          )} */}


          <div className="flex gap-3">
            <button
              onClick={onSetReminder}
              className="btn-primary flex-1"
              disabled={reminderLoading}
            >
              {reminderLoading ? "Setting..." : "Set Reminder"}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
