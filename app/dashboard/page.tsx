"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<
    { id: string; name: string; presents?: number; totalAttendance?: number }[]
  >([]);

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await res.json();
        console.log("✅ Courses fetched:", data.courses);
        setCourses(data.courses);
      } catch (err: any) {
        console.error("❌ Error fetching courses:", err.message);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">My Courses</h1>
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          />
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex justify-between items-center bg-blue-50 p-5 rounded-lg shadow border hover:shadow-md transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                <Link
                  href={{
                    pathname: `/dashboard/course/${course.id}`,
                    query: { name: course.name },
                  }}
                  className="text-lg font-semibold text-blue-800 hover:underline truncate"
                >
                  {course.name}
                </Link>
                <span className="text-gray-600 text-sm sm:ml-2">
                  Attendance: {typeof course.presents === "number" && typeof course.totalAttendance === "number" && course.totalAttendance > 0
                    ? `${Math.round((course.presents / course.totalAttendance) * 100)}%`
                    : "N/A%"}
                </span>
              </div>
              <button
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition shadow-sm border border-red-600 group-hover:scale-105"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm(`Delete course '${course.name}'?`)) return;
                  try {
                    const res = await fetch("/api/courses", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ courseId: course.id }),
                    });
                    if (!res.ok) throw new Error("Failed to delete course");
                    setCourses((prev) => prev.filter((c) => c.id !== course.id));
                  } catch (err) {
                    alert("Error deleting course");
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <p className="text-gray-500 text-center">
              No courses found for "{searchQuery}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
