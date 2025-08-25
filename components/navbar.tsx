"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type NavbarProps = {
  onHamburgerClick: () => void;
  onAddCourseClick: () => void;
};

interface UserProfile {
  timezone: string;
}

export default function Navbar({
  onHamburgerClick,
  onAddCourseClick,
}: NavbarProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    fetchUserProfile();
    // Update time every second
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [userProfile?.timezone]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const updateTime = () => {
    if (userProfile?.timezone) {
      const time = new Date().toLocaleString('en-US', { 
        timeZone: userProfile.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(time);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Redirect to login page
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettingsClick = () => {
    router.push("/dashboard/settings");
  };

  return (
    <div className="grid grid-cols-4 items-center px-6 py-4 bg-white/95 backdrop-blur-sm shadow-modern border-b border-gray-100">
      {/* Left: Hamburger */}
      <div className="flex justify-start">
        <div
          className="cursor-pointer text-2xl hover:scale-110 transition-transform duration-200 p-2 rounded-lg hover:bg-gray-100"
          onClick={onHamburgerClick}
        >
          ☰
        </div>
      </div>

      {/* Center: App Name */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎓</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AttendBuddy
          </h1>
        </div>
      </div>

      {/* Timezone Display */}
      <div className="flex justify-center">
        {userProfile?.timezone && (
          <div className="flex flex-col items-center text-sm">
            <div className="text-gray-600 font-medium">
              {userProfile.timezone.split('/').pop()?.replace('_', ' ')}
            </div>
            <div className="text-gray-800 font-mono">
              {currentTime}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex justify-end items-center space-x-3">
        <button
          className="btn-primary px-4 py-2 text-sm"
          onClick={onAddCourseClick}
        >
          ➕ Add Course
        </button>
        <button
          className="btn-secondary px-4 py-2 text-sm"
          onClick={handleSettingsClick}
          title="Settings"
        >
          ⚙️
        </button>
        <button 
          onClick={handleLogout}
          className="btn-danger px-4 py-2 text-sm"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
