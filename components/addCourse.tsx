"use client";

import { useState } from "react";

export default function AddCourse({ onCourseAdded }: { onCourseAdded?: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Course name cannot be empty");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Course created:", data.course);
        setSuccess("Course added successfully!");
        setName(""); // Clear input

        if (onCourseAdded) {
          onCourseAdded(); 
        }
      } else {
        console.error("❌ Error adding course:", data.message);
        setError(data.message || "Failed to add course");
      }
    } catch (err: any) {
      console.error("❌ Network error:", err.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add New Course</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <input
          type="text"
          placeholder="Enter course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Course"}
        </button>
      </form>
    </div>
  );
}
