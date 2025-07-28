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
    <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            My Courses
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Track your attendance and manage your academic progress
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-slide-up">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern w-full pl-12 pr-4"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-4 animate-fade-in">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="card-modern p-6 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={{
                      pathname: `/dashboard/course/${course.id}`,
                      query: { name: course.name },
                    }}
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline transition-all duration-200"
                  >
                    {course.name}
                  </Link>
                  
                  {/* Attendance Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 font-medium">
                        Attendance Rate
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {typeof course.presents === "number" && typeof course.totalAttendance === "number" && course.totalAttendance > 0
                          ? `${Math.round((course.presents / course.totalAttendance) * 100)}%`
                          : "N/A%"}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: typeof course.presents === "number" && typeof course.totalAttendance === "number" && course.totalAttendance > 0
                            ? `${(course.presents / course.totalAttendance) * 100}%`
                            : "0%"
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Present: {course.presents || 0}</span>
                      <span>Total: {course.totalAttendance || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="btn-danger px-4 py-2 text-sm"
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
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-white/80 text-lg">
                {searchQuery ? `No courses found for "${searchQuery}"` : "No courses yet"}
              </p>
              <p className="text-white/60 text-sm mt-2">
                {searchQuery ? "Try a different search term" : "Add your first course to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
