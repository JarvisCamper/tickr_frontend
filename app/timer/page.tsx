"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TimeControl } from './components/TimeControl';  
import { TimeEntriesTable } from './components/TimeEntriesTable';
import { ProjectModal } from './components/ProjectModal';
import { useTimer } from './hooks/useTimer';
import { useToast } from "../../context-and-provider";
import { useAuth } from "../../context-and-provider/AuthContext";
import { TimeEntry, Project } from './types';

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function TimerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { time, isRunning, formatTime, startTimer, stopTimer, getAuthHeaders } = useTimer();
  const { showToast } = useToast();
  
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const entriesPerPage = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchTimeEntries();
      checkActiveTimer();
    }
  }, [isAuthenticated]);

  const checkActiveTimer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/active/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.is_running) {
          setDescription(data.description);
          setSelectedProjectId(data.project?.id || null);
          startTimer();
        }
      }
    } catch (error) {
      console.error("Failed to check active timer:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        router.push('/login');
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      showToast("Failed to load projects", "error");
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data.filter((entry: TimeEntry) => !entry.is_running));
      } else if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        router.push('/login');
      }
    } catch (error) {
      console.error("Failed to fetch time entries:", error);
      showToast("Failed to load time entries", "error");
    }
  };

  const handleStart = async () => {
    if (!description.trim()) {
      showToast("Description is required to start timer", "error");
      return;
    }

    try {
      const payload: any = {
        description: description.trim(),
      };
      
      if (selectedProjectId) {
        payload.project_id = selectedProjectId;
      }

      const response = await fetch(`${API_BASE_URL}/entries/start/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        startTimer();
        showToast("Timer started!", "success");
      } else {
        const errorData = await response.json();
        console.error("Start timer error:", errorData);
        showToast(errorData.detail || "Failed to start timer", "error");
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      showToast("Error starting timer", "error");
    }
  };

  const handleStop = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/stop/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        stopTimer();
        setDescription("");
        setSelectedProjectId(null);
        fetchTimeEntries();
        showToast("Timer stopped and saved!", "success");
      } else {
        const errorData = await response.json();
        console.error("Stop timer error:", errorData);
        showToast(errorData.detail || "Failed to stop timer", "error");
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      showToast("Error stopping timer", "error");
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      showToast("Project name is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: newProjectName.trim(),
        type: "individual",
      };

      const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([...projects, data]);
        setNewProjectName("");
        setShowProjectModal(false);
        showToast("Project created successfully!", "success");
      } else {
        const errorData = await response.json();
        console.error("Create project error:", errorData);
        showToast(errorData.detail || errorData.name?.[0] || "Failed to create project", "error");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      showToast("Error creating project", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditDescription(entry.description);
  };

  const handleSaveEdit = async (entryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${entryId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ description: editDescription.trim() }),
      });

      if (response.ok) {
        fetchTimeEntries();
        setEditingEntry(null);
        showToast("Entry updated!", "success");
      } else {
        const errorData = await response.json();
        console.error("Update entry error:", errorData);
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
      const response = await fetch(`${API_BASE_URL}/entries/${id}/`, {
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

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = timeEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(timeEntries.length / entriesPerPage);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Time Tracker</h1>

        <TimeControl
          description={description}
          setDescription={setDescription}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          projects={projects}
          time={time}
          formatTime={formatTime}
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onAddProject={() => setShowProjectModal(true)}
        />

        <TimeEntriesTable
          entries={currentEntries}
          editingEntry={editingEntry}
          editDescription={editDescription}
          setEditDescription={setEditDescription}
          onEdit={handleEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingEntry(null)}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <ProjectModal
          isOpen={showProjectModal}
          projectName={newProjectName}
          setProjectName={setNewProjectName}
          onClose={() => {
            setShowProjectModal(false);
            setNewProjectName("");
          }}
          onCreate={handleCreateProject}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}