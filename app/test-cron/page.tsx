'use client';

import { useState } from 'react';

export default function TestCronPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestCronResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Type definitions
  interface TestCronResults {
    success: boolean;
    mode: string;
    timezonesProcessed: number;
    usersProcessed: number;
    remindersFound: number;
    errors: number;
    timestamp: string;
    utcHour: number;
    simulationResults: SimulationResult[];
    debugMode: boolean;
    note: string;
  }

  interface SimulationResult {
    user: {
      id: string;
      email: string;
      name: string;
    };
    timezone: string;
    reminders: {
      courseName: string;
      message: string | null;
      reminderDate: string;
    }[];
    emailContent: string;
    wouldSend: boolean;
  }

  const testCron = async (debugMode = false) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const url = debugMode ? '/api/test-cron?debug=true' : '/api/test-cron';
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to test cron');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Cron API Test Page
          </h1>
          
          <div className="mb-6">
                                      <p className="text-gray-600 mb-4">
                This page allows you to test the cron API logic locally without deploying. 
                It will simulate the reminder processing for the current UTC hour.
                <br />
                <strong>Note:</strong> Only users from the current timezone group will be processed.
              </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => testCron(false)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '🔄 Testing...' : '🚀 Test Cron Logic'}
              </button>
              
              <button
                onClick={() => testCron(true)}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? '🔄 Testing...' : '🔧 Debug Mode (All Timezones)'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">✅ Test Completed Successfully</h3>
                <p className="text-green-700">{results.note}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">📊 Summary</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>UTC Hour: {results.utcHour}</li>
                    <li>Timezones Processed: {results.timezonesProcessed}</li>
                    <li>Users Processed: {results.usersProcessed}</li>
                    <li>Reminders Found: {results.remindersFound}</li>
                    <li>Errors: {results.errors}</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">⏰ Timing</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>Timestamp: {new Date(results.timestamp).toLocaleString()}</li>
                    <li>Mode: {results.mode}</li>
                  </ul>
                </div>
              </div>

              {results.simulationResults && results.simulationResults.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">📧 Simulation Results</h4>
                  <div className="space-y-3">
                                         {results.simulationResults.map((result: SimulationResult, index: number) => (
                       <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                         <div className="flex items-center justify-between mb-2">
                           <h5 className="font-medium text-blue-800">
                             {result.user.name} ({result.user.email})
                           </h5>
                           <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                             {result.timezone}
                           </span>
                         </div>
                         <div className="text-sm text-blue-700">
                           <p className="mb-2">
                             <strong>{result.reminders.length} reminder(s):</strong>
                           </p>
                           <ul className="list-disc list-inside space-y-1">
                             {result.reminders.map((reminder, rIndex: number) => (
                               <li key={rIndex}>
                                 {reminder.courseName}
                                 {reminder.message && ` - ${reminder.message}`}
                               </li>
                             ))}
                           </ul>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {results.simulationResults && results.simulationResults.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-yellow-800 font-semibold mb-2">⚠️ No Reminders Found</h4>
                  <p className="text-yellow-700">
                    No reminders were found for the current timezone group. This could mean:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-yellow-700">
                    <li>No users have reminders set for today</li>
                                       <li>No reminders exist in the database</li>
                   <li>The timezone logic isn&apos;t matching any current reminders</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
