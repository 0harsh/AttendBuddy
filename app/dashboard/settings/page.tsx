"use client";

import { useState, useEffect } from "react";
import TimezoneSelector from "@/components/TimezoneSelector";

interface UserProfile {
  name: string;
  email: string;
  timezone: string;
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    if (!userProfile) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/timezone", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timezone: newTimezone }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserProfile(prev => prev ? { ...prev, timezone: data.timezone } : null);
        setMessage({ type: 'success', text: 'Timezone updated successfully!' });
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to update timezone' });
      }
    } catch (error) {
      console.error("Error updating timezone:", error);
      setMessage({ type: 'error', text: 'Failed to update timezone' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white/80 mt-4">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-white/80">Failed to load user profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            ⚙️ Settings
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Manage your account preferences and timezone settings
          </p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6 animate-fade-in">
          {/* User Profile Card */}
          <div className="card-modern p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              👤 User Profile
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {userProfile.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {userProfile.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timezone Settings Card */}
          <div className="card-modern p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              🌍 Timezone Settings
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Set your local timezone to ensure reminders are sent at the correct time for your location.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Timezone
                </label>
                <TimezoneSelector
                  currentTimezone={userProfile.timezone}
                  onTimezoneChange={handleTimezoneChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Timezone Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">ℹ️ How it works:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Reminders are processed based on your local timezone</li>
                  <li>• The system runs hourly to check for reminders in different timezones</li>
                  <li>• Your reminders will be sent at the appropriate local time</li>
                  <li>• Changes take effect immediately for new reminders</li>
                </ul>
              </div>

              {/* Current Time Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">🕐 Current Time in Your Timezone:</h3>
                <div className="text-lg font-mono text-gray-900">
                  {new Date().toLocaleString('en-US', { 
                    timeZone: userProfile.timezone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Timezone: {userProfile.timezone}
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings Card */}
          <div className="card-modern p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              🔔 Notification Settings
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Configure how and when you receive attendance reminders.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Note:</h3>
                <p className="text-sm text-yellow-700">
                  Reminder emails are automatically sent based on your timezone settings. 
                  The system processes reminders every hour to ensure timely delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <span>{message.type === 'success' ? '✅' : '❌'}</span>
                <span>{message.text}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
