
import { useState, useEffect } from 'react';

interface TimezoneSelectorProps {
  currentTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  disabled?: boolean;
}

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: '+5:30' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (BST)', offset: '+6:00' },
  { value: 'Asia/Bangkok', label: 'Thailand (ICT)', offset: '+7:00' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+8:00' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: '+9:00' },
  { value: 'Australia/Sydney', label: 'Australia (AEST)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST)', offset: '+12:00' },
  { value: 'Europe/London', label: 'UK (GMT)', offset: '+0:00' },
  { value: 'Europe/Paris', label: 'France (CET)', offset: '+1:00' },
  { value: 'America/New_York', label: 'New York (EST)', offset: '-5:00' },
  { value: 'America/Chicago', label: 'Chicago (CST)', offset: '-6:00' },
  { value: 'America/Denver', label: 'Denver (MST)', offset: '-7:00' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: '-8:00' },
];

export default function TimezoneSelector({ currentTimezone, onTimezoneChange, disabled = false }: TimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTimezones = COMMON_TIMEZONES.filter(tz =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTz = COMMON_TIMEZONES.find(tz => tz.value === currentTimezone);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className="block truncate">
          {currentTz ? `${currentTz.label} (${currentTz.offset})` : currentTimezone}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search timezones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="max-h-60 overflow-auto">
            {filteredTimezones.map((timezone) => (
              <button
                key={timezone.value}
                type="button"
                onClick={() => {
                  onTimezoneChange(timezone.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                  timezone.value === currentTimezone ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{timezone.label}</span>
                  <span className="text-sm text-gray-500">{timezone.offset}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

