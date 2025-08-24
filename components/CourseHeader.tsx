interface CourseHeaderProps {
  courseName: string | null;
}

export default function CourseHeader({ courseName }: CourseHeaderProps) {
  return (
    <div className="text-center mb-8 animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
        {courseName ?? "Course"}
      </h1>
      <p className="text-white/80 text-lg">
        Click a date to mark attendance or set reminders
      </p>
    </div>
  );
}
