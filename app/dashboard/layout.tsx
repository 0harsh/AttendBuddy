"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import AddCourse from "@/components/addCourse";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false); // 👈 Modal state

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Navbar */}
      <Navbar
        onHamburgerClick={() => setSidebarOpen(!sidebarOpen)}
        onAddCourseClick={() => setIsAddCourseOpen(true)} // 👈 Pass prop
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>

      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <AddCourse
              onCourseAdded={() => {
                setIsAddCourseOpen(false); // ✅ Close modal after adding
              }}
            />
            <button
              onClick={() => setIsAddCourseOpen(false)}
              className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
