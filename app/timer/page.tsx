"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TimeControl } from './components/TimeControl';  
import { TimeEntriesTable } from './components/TimeEntriesTable';
import { ProjectModal } from './components/ProjectModal';
import { EditEntryModal } from './components/EditEntryModel';
import { useTimer } from './hooks/useTimer';
import { useToast } from "../../context-and-provider";
import { useAuth } from "../../context-and-provider/AuthContext";
import { TimeEntry, Project } from './types';
import { getApiUrl } from '@/constant/apiendpoints';

export default function TimerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { time, isRunning, isPaused, formatTime, startTimer, pauseTimer, resumeTimer, stopTimer, getAuthHeaders } = useTimer();
  const { showToast } = useToast();
  
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
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
      const response = await fetch(getApiUrl("entries/active/"), {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.is_running) {
          setDescription(data.description);
          setSelectedProjectId(data.project?.id || null);
          setActiveEntryId(data.id || null);
          // If backend provides a start timestamp, use it to compute elapsed so timer continues correctly across reloads
          if (data.started_at) {
            startTimer(data.started_at);
          } else if (data.start_time) {
            startTimer(data.start_time);
          } else {
            startTimer();
          }
        }
      }
    } catch (error) {
      console.error("Failed to check active timer:", error);
    }
  };

  // When description or project changes while timer is running, PATCH the active entry so server stores latest values
  useEffect(() => {
    const updateActive = async () => {
      if (!isRunning || !activeEntryId) return;
      try {
        const payload: any = {};
        if (description !== undefined) payload.description = description;
        if (selectedProjectId !== undefined) payload.project_id = selectedProjectId;

        await fetch(getApiUrl(`entries/${activeEntryId}/`), {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Failed to update active entry:', err);
      }
    };

    // Fire update (no debounce for simplicity). This updates server-side active entry so final saved entry uses latest description/project.
    updateActive();
  }, [description, selectedProjectId, isRunning, activeEntryId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(getApiUrl("projects/"), {
        headers: getAuthHeaders(),
        credentials: 'include',
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
      const response = await fetch(getApiUrl("entries/"), {
        headers: getAuthHeaders(),
        credentials: 'include',
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

      const response = await fetch(getApiUrl("entries/start/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      }); 
      const d = await response.json().catch(() => null);

      if (response.ok) {
        // Use server-provided start timestamp if available so elapsed is consistent
        const serverStart = d?.started_at || d?.start_time;
        startTimer(serverStart);
        // If server returns created entry with id, track it so we can update it while running
        if (d && d.id) {
          setActiveEntryId(d.id);
        } else {
          // attempt to fetch active entry to obtain id/start time
          try {
            const activeResp = await fetch(getApiUrl('entries/active/'), { headers: getAuthHeaders(), credentials: 'include' });
            if (activeResp.ok) {
              const activeData = await activeResp.json().catch(() => null);
              if (activeData) {
                if (activeData.id) setActiveEntryId(activeData.id);
                const srvStart = activeData.started_at || activeData.start_time;
                if (srvStart) startTimer(srvStart);
              }
            }
          } catch (err) {
            // ignore
          }
        }
        showToast("Timer started!", "success");
      } else {
        console.error("Start timer error:", d);
        showToast(d?.detail || "Failed to start timer", "error");
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      showToast("Error starting timer", "error");
    }
  };

  const handleStop = async () => {
    try {
      const response = await fetch(getApiUrl("entries/stop/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        stopTimer();
        setActiveEntryId(null);
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

      const response = await fetch(getApiUrl("projects/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([...projects, data]);
        // select the newly created project so user can attach running timer to it immediately
        if (data && data.id) setSelectedProjectId(data.id);
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

  const handleEdit = async (entry: TimeEntry) => {
    // Ensure we have the latest projects before opening the edit modal so the select can find the project's option
    try {
      const entryProjId = (entry as any).project?.id ?? (entry as any).project ?? (entry as any).project_id ?? null;
      console.debug('Opening edit modal for entry', entry.id, 'entryProjId=', entryProjId, 'projectsHave=', projects.map(p=>p.id));
      if (entryProjId && !projects.some((p) => p.id === entryProjId)) {
        await fetchProjects();
      }
    } catch (err) {
      // ignore
    }
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (entryId: number, updates: Partial<TimeEntry>) => {
    try {
      const response = await fetch(getApiUrl(`entries/${entryId}/`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchTimeEntries();
        setShowEditModal(false);
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
      const response = await fetch(getApiUrl(`entries/${id}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
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
          isPaused={isPaused}
          onStart={handleStart}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={handleStop}
          onAddProject={() => setShowProjectModal(true)}
        />

        <TimeEntriesTable
          entries={currentEntries}
          onEdit={handleEdit}
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

        <EditEntryModal
          isOpen={showEditModal}
          entry={editingEntry}
          projects={projects}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntry(null);
          }}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
}