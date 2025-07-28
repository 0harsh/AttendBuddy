"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Course {
  id: string;
  name: string;
}

interface AttendanceRecord {
  courseId: string;
  courseName: string;
  status: string;
}

export default function SearchAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
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
      setAttendanceRecords([]);
      setError("");
      
      try {
        const records: AttendanceRecord[] = [];
        
        await Promise.all(
          courses.map(async (course) => {
            const res = await fetch(`/api/attendance?courseId=${course.id}`);
            if (!res.ok) return;
            
            const data = await res.json();
            const record = data.attendances.find(
              (a: any) => new Date(a.date).toDateString() === selectedDate.toDateString()
            );
            
            // Only add records that have attendance entries
            if (record) {
              records.push({
                courseId: course.id,
                courseName: course.name,
                status: record.status
              });
            }
          })
        );
        
        // Sort: Absents first, then Presents
        const sortedRecords = records.sort((a, b) => {
          if (a.status === "Absent" && b.status === "Present") return -1;
          if (a.status === "Present" && b.status === "Absent") return 1;
          return 0;
        });
        
        setAttendanceRecords(sortedRecords);
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
    <div className="min-h-screen gradient-bg py-8 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Search Attendance
          </h1>
          <p className="text-white/90 text-lg">
            Select a date to view attendance records
          </p>
        </div>

        {/* Calendar */}
        <div className="card-modern p-8 mb-8 animate-slide-up">
          <div className="flex flex-col items-center">
            <Calendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              className="rounded-2xl shadow-modern"
            />
          </div>
        </div>

        {/* Results */}
        {selectedDate && (
          <div className="card-modern p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Attendance for {selectedDate.toLocaleDateString()}
            </h2>
            
            {error && (
              <div className="text-center mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading attendance records...</p>
              </div>
            ) : attendanceRecords.length > 0 ? (
              <div className="space-y-4">
                {attendanceRecords.map((record, index) => (
                  <div
                    key={record.courseId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl shadow-modern border transition-all duration-200 hover:shadow-modern-lg group"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      backgroundColor: record.status === "Absent" ? "#fef2f2" : "#f0fdf4",
                      borderColor: record.status === "Absent" ? "#fecaca" : "#bbf7d0"
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {record.courseName}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      {record.status === "Present" ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                          ✅ Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                          ❌ Absent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-600 text-lg">
                  No attendance records found for this date
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try selecting a different date or check if attendance was marked
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no date selected */}
        {!selectedDate && (
          <div className="card-modern p-8 text-center animate-fade-in">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Select a Date
            </h3>
            <p className="text-gray-600">
              Choose a date from the calendar above to view attendance records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
