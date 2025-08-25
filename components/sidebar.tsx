"use client";

import { useRouter } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard", type: "link" },
  { label: "Quick Attendance", icon: "✅", href: "/dashboard/QuickAttendance", type: "quick" },
  { label: "Search Attendance", icon: "🔍", href: "/dashboard/searchAttendance", type: "search" },
  { label: "About Us", icon: "ℹ️", href: "/dashboard/about", type: "link" },
  { label: "Settings", icon: "⚙️", href: "/dashboard/settings", type: "link" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Close sidebar first
        onClose();
        // Redirect to login page
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 animate-fade-in"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-20 left-0 top-0 h-screen w-72 bg-white/95 backdrop-blur-sm shadow-modern-lg border-r border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/App Name */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-3xl">🎓</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AttendBuddy</h1>
            <p className="text-xs text-gray-500">Your attendance buddy</p>
          </div>
          <button
            className="ml-auto text-gray-400 hover:text-red-500 text-xl focus:outline-none p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item, index) =>
            item.type === "quick" || item.type === "search" ? (
              <button
                key={item.label}
                className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 group hover-lift"
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                tabIndex={0}
                type="button"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                <span className="text-base">{item.label}</span>
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 group hover-lift"
                tabIndex={0}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                <span className="text-base">{item.label}</span>
              </a>
            )
          )}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-4"></div>

        {/* Logout at bottom */}
        <div className="px-4 py-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 btn-danger py-3 rounded-xl font-semibold shadow-lg"
          >
            <span className="text-lg">🚪</span> 
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
