export default function AttendanceLegend() {
  return (
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
  );
}
