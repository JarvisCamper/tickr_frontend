"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useProjects } from '../layout';

interface TimeEntry {
  id: number;
  user: string;
  description: string;
  project?: { id: number; name: string } | null;
  start_time: string;
  end_time: string | null;
  date: string;
  duration: string;
  is_running: boolean;
}

export default function TimerPage() {
  const { projects: contextProjects } = useProjects(); // Get projects from context
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runningEntryId, setRunningEntryId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const entriesPerPage = 10;

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch user info and data on mount
  useEffect(() => {
    fetchUserInfo();
    fetchTimeEntries();
    checkRunningTimer();
  }, []);

  // Timer logic - counts seconds since start
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const getAuthHeaders = () => {
    const token = Cookies.get("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  const checkRunningTimer = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/entries/", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const running = data.find((entry: TimeEntry) => entry.is_running);
        if (running) {
          setIsRunning(true);
          setRunningEntryId(running.id);
          setDescription(running.description);
          setSelectedProjectId(running.project?.id || null);
          // Calculate elapsed time from start_time
          const start = new Date(running.start_time);
          setStartTime(start);
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
          setTime(elapsed);
        }
      }
    } catch (error) {
      console.error("Failed to check running timer:", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/entries/", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out running entries from the list
        setTimeEntries(data.filter((entry: TimeEntry) => !entry.is_running));
      }
    } catch (error) {
      console.error("Failed to fetch time entries:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!description.trim()) {
      showToast("Description is required to start timer", "error");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/entries/start/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description,
          project_id: selectedProjectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsRunning(true);
        setRunningEntryId(data.id);
        setStartTime(new Date());
        setTime(0);
        showToast("Timer started!", "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.detail || "Failed to start timer", "error");
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      showToast("Error starting timer", "error");
    }
  };

  const handleStop = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/entries/stop/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          project_id: selectedProjectId,
        }),
      });

      if (response.ok) {
        setIsRunning(false);
        setRunningEntryId(null);
        setTime(0);
        setStartTime(null);
        setDescription("");
        setSelectedProjectId(null);
        fetchTimeEntries();
        showToast("Timer stopped and saved!", "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.detail || "Failed to stop timer", "error");
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      showToast("Error stopping timer", "error");
    }
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditDescription(entry.description);
  };

  const handleSaveEdit = async (entryId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/entries/${entryId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ description: editDescription }),
      });

      if (response.ok) {
        fetchTimeEntries();
        setEditingEntry(null);
        showToast("Entry updated!", "success");
      } else {
        showToast("Failed to update entry", "error");
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      showToast("Error updating entry", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/entries/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setTimeEntries(timeEntries.filter(entry => entry.id !== id));
        showToast("Entry deleted!", "success");
      } else {
        showToast("Failed to delete entry", "error");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      showToast("Error deleting entry", "error");
    }
  };

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = timeEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(timeEntries.length / entriesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Time Tracker</h1>

        {/* Timer Input Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on? *"
              className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              disabled={isRunning}
            />

            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black min-w-[200px]"
              disabled={isRunning}
            >
              <option value="">No project</option>
              {contextProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

            <div className="text-2xl font-mono font-semibold text-gray-900 min-w-[120px] text-center">
              {formatTime(time)}
            </div>

            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-md transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Time Entries</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Project</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No time entries yet. Start tracking your time!
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingEntry === entry.id ? (
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-black"
                          />
                        ) : (
                          entry.description
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.project?.name || "No project"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.start_time}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.end_time || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.duration}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        {editingEntry === entry.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(entry.id)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingEntry(null)}
                              className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}