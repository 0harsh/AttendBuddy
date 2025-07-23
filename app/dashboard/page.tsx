"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<
    { id: string; name: string; attendance?: number }[]
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
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCourses.map((course) => (
          <Link
            key={course.id}
            href={{
              pathname: `/dashboard/course/${course.id}`,
              query: { name: course.name }, // 👈 pass course name
            }}
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border hover:shadow-md transition cursor-pointer">
              <div className="text-lg font-medium">{course.name}</div>
              <div className="text-gray-600">
                Attendance: {course.attendance ?? "N/A"}%
              </div>
            </div>
          </Link>

        ))}
        {filteredCourses.length === 0 && (
          <p className="text-gray-500 text-center">
            No courses found for "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
}
