"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SearchAttendancePage() {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data.courses);
      } catch (err) {
        setError("Error fetching courses");
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    async function fetchAttendanceForDate() {
      if (!selectedDate) return;
      setLoading(true);
      setAttendance({});
      setError("");
      try {
        const results: Record<string, string> = {};
        await Promise.all(
          courses.map(async (course) => {
            const res = await fetch(
              `/api/attendance?courseId=${course.id}`
            );
            if (!res.ok) return;
            const data = await res.json();
            const record = data.attendances.find(
              (a: any) =>
                new Date(a.date).toDateString() === selectedDate.toDateString()
            );
            results[course.id] = record ? record.status : "None";
          })
        );
        setAttendance(results);
      } catch (err) {
        setError("Error fetching attendance");
      } finally {
        setLoading(false);
      }
    }
    if (selectedDate && courses.length > 0) {
      fetchAttendanceForDate();
    }
  }, [selectedDate, courses]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Search Attendance</h1>
        <div className="flex flex-col items-center mb-8">
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
            className="rounded-lg shadow"
          />
        </div>
        {selectedDate && (
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
            Attendance for {selectedDate.toLocaleDateString()}
          </h2>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="space-y-4">
          {selectedDate && courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 p-5 rounded-lg shadow border group gap-4"
            >
              <div className="flex-1 text-lg font-semibold text-blue-800 truncate">{course.name}</div>
              <div className="text-base font-medium">
                {loading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : attendance[course.id] === "Present" ? (
                  <span className="text-green-600">Present</span>
                ) : attendance[course.id] === "Absent" ? (
                  <span className="text-red-600">Absent</span>
                ) : (
                  <span className="text-gray-500">No record</span>
                )}
              </div>
            </div>
          ))}
          {selectedDate && courses.length === 0 && (
            <p className="text-gray-500 text-center">No courses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
