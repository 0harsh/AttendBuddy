"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCourseRefresh } from "../layout";

export default function QuickAttendancePage() {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent" | null>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { refreshTrigger } = useCourseRefresh();

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
        const initial: Record<string, "Present" | "Absent" | null> = {};
        data.courses.forEach((c: { id: string }) => (initial[c.id] = null));
        setAttendance(initial);
      } catch (err: unknown) {
        console.error("Error fetching courses:", err);
        setError("Error fetching courses");
      }
    }
    fetchCourses();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMark = (courseId: string, status: "Present" | "Absent") => {
    setAttendance((prev) => ({ ...prev, [courseId]: prev[courseId] === status ? null : status }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    const presents = Object.keys(attendance).filter((id) => attendance[id] === "Present");
    const absents = Object.keys(attendance).filter((id) => attendance[id] === "Absent");
    try {
      const res = await fetch("/api/quickattendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presents, absents }),
      });
      if (!res.ok) throw new Error("Failed to submit quick attendance");
      setSuccess("Quick attendance submitted successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Error submitting quick attendance:", err);
      setError("Error submitting quick attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Quick Attendance
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Mark attendance for all your courses at once
          </p>
        </div>

        {/* Main Content Card */}
        <div className="card-modern p-8 animate-slide-up">
          {/* Search Bar */}
          <div className="mb-8">
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

          {/* Error and Success Messages */}
          {error && (
            <div className="text-center mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="text-center mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Courses List */}
          <div className="space-y-4 mb-8">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="card-modern p-6 hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{course.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        attendance[course.id] === "Present"
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg"
                          : "bg-white text-green-700 border-green-400 hover:bg-green-50 hover:border-green-500 focus:ring-green-500"
                      }`}
                      onClick={() => handleMark(course.id, "Present")}
                      type="button"
                    >
                      ✅ Present
                    </button>
                    <button
                      className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        attendance[course.id] === "Absent"
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg"
                          : "bg-white text-red-700 border-red-400 hover:bg-red-50 hover:border-red-500 focus:ring-red-500"
                      }`}
                      onClick={() => handleMark(course.id, "Absent")}
                      type="button"
                    >
                      ❌ Absent
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 text-lg">
                  {searchQuery ? `No courses found for "${searchQuery}"` : "No courses available"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchQuery ? "Try a different search term" : "Add courses to get started"}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="btn-primary w-full py-4 text-lg font-semibold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Quick Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
