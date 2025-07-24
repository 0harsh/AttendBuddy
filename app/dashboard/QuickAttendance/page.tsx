"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickAttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<
    { id: string; name: string }[]
  >([]);
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent" | null>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data.courses);
        // Initialize attendance state
        const initial: Record<string, "Present" | "Absent" | null> = {};
        data.courses.forEach((c: { id: string }) => (initial[c.id] = null));
        setAttendance(initial);
      } catch (err: any) {
        setError("Error fetching courses");
      }
    }
    fetchCourses();
  }, []);

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
    } catch (err) {
      setError("Error submitting quick attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Quick Attendance</h1>
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          />
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}
        <div className="space-y-4 mb-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 p-5 rounded-lg shadow border hover:shadow-md transition group gap-4"
            >
              <div className="flex-1 text-lg font-semibold text-blue-800 truncate">{course.name}</div>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-150 ${
                    attendance[course.id] === "Present"
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-white text-green-700 border-green-400 hover:bg-green-50"
                  }`}
                  onClick={() => handleMark(course.id, "Present")}
                  type="button"
                >
                  Present
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors duration-150 ${
                    attendance[course.id] === "Absent"
                      ? "bg-red-500 text-white border-red-600"
                      : "bg-white text-red-700 border-red-400 hover:bg-red-50"
                  }`}
                  onClick={() => handleMark(course.id, "Absent")}
                  type="button"
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <p className="text-gray-500 text-center">
              No courses found for "{searchQuery}"
            </p>
          )}
        </div>
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
