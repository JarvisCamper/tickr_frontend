"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { TimeControl } from "./components/TimeControl";
import { TimeEntriesTable } from "./components/TimeEntriesTable";
import { ProjectModal } from "./components/ProjectModal";
import { EditEntryModal } from "./components/EditEntryModel";
import { useTimer } from "./hooks/useTimer";
import { useToast } from "../../context-and-provider";
import { useEmployeeRouteGuard } from "@/app/hooks/useEmployeeRouteGuard";
import { TimeEntry, Project } from "./types";
import { getApiUrl } from "@/constant/apiendpoints";

const SCREENSHOT_INTERVAL_MS = 10 * 60 * 1000;
type ScreenshotStatus = "idle" | "requesting" | "active" | "ended" | "unsupported";

export default function TimerPage() {
  const router = useRouter();
  const { isLoading: authLoading, isEmployeeAllowed } = useEmployeeRouteGuard();
  const { time, isRunning, isPaused, formatTime, startTimer, stopTimer, getAuthHeaders } =
    useTimer();
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
  const [isActionPending, setIsActionPending] = useState(false);
  const [screenshotStatus, setScreenshotStatus] = useState<ScreenshotStatus>("idle");
  const [lastScreenshotAt, setLastScreenshotAt] = useState<string | null>(null);

  const initLoadedRef = useRef(false);
  const captureIntervalRef = useRef<number | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const captureVideoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRequestInFlightRef = useRef(false);

  const entriesPerPage = 10;

  const getProjectId = (entry: any): number | null => {
    const raw = entry?.project?.id ?? entry?.project ?? entry?.project_id ?? null;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const extractErrorMessage = (payload: unknown, fallback: string) => {
    if (!payload) return fallback;

    if (typeof payload === "string") {
      const trimmed = payload.trim();
      if (!trimmed) return fallback;

      try {
        return extractErrorMessage(JSON.parse(trimmed), fallback);
      } catch {
        return trimmed;
      }
    }

    if (typeof payload === "object") {
      const detail = (payload as Record<string, unknown>).detail;
      if (typeof detail === "string" && detail.trim()) {
        return detail.trim();
      }

      const message = (payload as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) {
        return message.trim();
      }
    }

    return fallback;
  };

  const readErrorMessage = async (response: Response, fallback: string) => {
    const raw = await response.text().catch(() => "");
    return extractErrorMessage(raw, fallback);
  };

  const stopMediaStream = (stream?: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const resetActiveTimerUi = (nextScreenshotStatus: ScreenshotStatus = "idle") => {
    stopTimer();
    setActiveEntryId(null);
    setDescription("");
    setSelectedProjectId(null);
    setLastScreenshotAt(null);
    setScreenshotStatus(nextScreenshotStatus);
  };

  const stopScreenshotMonitoring = (stopStream = true) => {
    if (captureIntervalRef.current) {
      window.clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (stopStream && screenStreamRef.current) {
      stopMediaStream(screenStreamRef.current);
      screenStreamRef.current = null;
    }

    if (stopStream) {
      captureVideoRef.current = null;
      captureCanvasRef.current = null;
      setScreenshotStatus("idle");
    }
  };

  const syncTimerStateFromServer = async () => {
    try {
      const response = await fetch(getApiUrl("/api/entries/active/"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        resetActiveTimerUi("ended");
        return false;
      }

      const data = await response.json().catch(() => null);
      if (!data || !data.is_running) {
        resetActiveTimerUi("ended");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to sync active timer state:", error);
      resetActiveTimerUi("ended");
      return false;
    }
  };

  const ensureCaptureVideoReady = async (stream: MediaStream) => {
    let video = captureVideoRef.current;
    if (!video) {
      video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      captureVideoRef.current = video;
    }

    video.srcObject = stream;

    await new Promise<void>((resolve) => {
      if (video!.readyState >= 1) {
        resolve();
        return;
      }

      video!.onloadedmetadata = () => resolve();
    });

    await video.play().catch(() => undefined);
  };

  const uploadScreenshot = async (entryId: number) => {
    const video = captureVideoRef.current;
    const stream = screenStreamRef.current;
    if (!video || !stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    let canvas = captureCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      captureCanvasRef.current = canvas;
    }

    const settings = track.getSettings();
    canvas.width = Math.max(1, settings.width || video.videoWidth || 1280);
    canvas.height = Math.max(1, settings.height || video.videoHeight || 720);

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas!.toBlob((generatedBlob) => resolve(generatedBlob), "image/jpeg", 0.86);
    });

    if (!blob) return;

    const token = Cookies.get("access_token");
    if (!token) return;

    const formData = new FormData();
    formData.append("time_entry", String(entryId));
    formData.append("capture_source", "screen-share");
    formData.append("image", blob, `screenshot-${Date.now()}.jpg`);

    const response = await fetch(getApiUrl("/api/screenshots/"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, "Failed to upload screenshot.");
      throw new Error(errorMessage);
    }

    setLastScreenshotAt(new Date().toLocaleString());
  };

  const beginScreenshotMonitoring = async (stream: MediaStream, entryId: number) => {
    screenStreamRef.current = stream;
    await ensureCaptureVideoReady(stream);
    setScreenshotStatus("active");

    stream.getVideoTracks().forEach((track) => {
      track.addEventListener("ended", () => {
        stopScreenshotMonitoring(false);
        screenStreamRef.current = null;
        captureVideoRef.current = null;
        captureCanvasRef.current = null;
        void forceStopTimerAfterScreenShareEnded();
      });
    });

    await uploadScreenshot(entryId);

    captureIntervalRef.current = window.setInterval(() => {
      void uploadScreenshot(entryId).catch((error) => {
        console.error("Screenshot upload failed:", error);
      });
    }, SCREENSHOT_INTERVAL_MS);
  };

  const requestScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setScreenshotStatus("unsupported");
      throw new Error("This browser does not support screen sharing for screenshot capture.");
    }

    setScreenshotStatus("requesting");
    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  };

  const enableScreenshotsForActiveEntry = async (entryId: number) => {
    const stream = await requestScreenShare();
    try {
      await beginScreenshotMonitoring(stream, entryId);
      showToast("Screenshot monitoring is active for this timer session.", "success");
    } catch (error) {
      stopMediaStream(stream);
      setScreenshotStatus("ended");
      throw error;
    }
  };

  const forceStopTimerAfterScreenShareEnded = async () => {
    if (stopRequestInFlightRef.current) return;
    stopRequestInFlightRef.current = true;
    let shouldResetUi = true;

    try {
      const response = await fetch(getApiUrl("/api/entries/stop/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const backendAlreadyStopped =
          response.status === 400 &&
          /no active|not running|already stopped|no running/i.test(errorText);

        if (!backendAlreadyStopped) {
          throw new Error(errorText || "Failed to stop timer after screen sharing ended.");
        }
      }
    } catch (error) {
      console.error("Auto-stop timer after screen share end failed:", error);
      const stillRunning = await syncTimerStateFromServer();
      if (stillRunning) {
        shouldResetUi = false;
      }
    } finally {
      if (shouldResetUi) {
        resetActiveTimerUi("ended");
        void fetchTimeEntries();
      }
      stopRequestInFlightRef.current = false;
    }

    if (!shouldResetUi) return;
    showToast("Screen sharing stopped, so the running timer was ended automatically.", "error");
  };

  useEffect(() => {
    if (!isEmployeeAllowed || initLoadedRef.current) return;
    initLoadedRef.current = true;

    void Promise.all([fetchProjects(), fetchTimeEntries(), checkActiveTimer()]);
  }, [isEmployeeAllowed]);

  useEffect(() => {
    return () => {
      stopScreenshotMonitoring();
    };
  }, []);

  const checkActiveTimer = async () => {
    try {
      const response = await fetch(getApiUrl("/api/entries/active/"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.is_running) {
          setDescription(data.description);
          setSelectedProjectId(getProjectId(data));
          setActiveEntryId(data.id || null);
          setScreenshotStatus("ended");

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

  useEffect(() => {
    if (!isRunning || !activeEntryId) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        const payload: Record<string, unknown> = {};
        if (description !== undefined) payload.description = description;
        if (selectedProjectId !== undefined) payload.project = selectedProjectId;

        await fetch(getApiUrl(`/api/entries/${activeEntryId}/`), {
          method: "PATCH",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Failed to update active entry:", error);
      }
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [description, selectedProjectId, isRunning, activeEntryId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(getApiUrl("/api/projects/"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      showToast("Failed to load projects", "error");
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(getApiUrl("/api/entries/"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data.filter((entry: TimeEntry) => !entry.is_running));
      } else if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch time entries:", error);
      showToast("Failed to load time entries", "error");
    }
  };

  const handleStart = async () => {
    if (isActionPending) return;
    if (!description.trim()) {
      showToast("Description is required to start timer", "error");
      return;
    }

    const confirmed = window.confirm(
      "Starting a tracked session will request screen sharing, take one screenshot immediately, and continue every 10 minutes while the timer is running. Continue?"
    );
    if (!confirmed) return;

    setIsActionPending(true);
    let pendingStream: MediaStream | null = null;

    try {
      pendingStream = await requestScreenShare();

      const payload: Record<string, unknown> = {
        description: description.trim(),
      };

      if (selectedProjectId !== null) {
        payload.project = selectedProjectId;
      }

      const response = await fetch(getApiUrl("/api/entries/start/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (response.ok) {
        const serverStart = data?.started_at || data?.start_time;
        startTimer(serverStart);

        let resolvedEntryId: number | null = null;

        if (data?.id) {
          resolvedEntryId = data.id;
          setActiveEntryId(data.id);
        } else {
          try {
            const activeResponse = await fetch(getApiUrl("/api/entries/active/"), {
              headers: getAuthHeaders(),
              credentials: "include",
            });
            if (activeResponse.ok) {
              const activeData = await activeResponse.json().catch(() => null);
              if (activeData) {
                if (activeData.id) {
                  resolvedEntryId = activeData.id;
                  setActiveEntryId(activeData.id);
                }
                const restoredStart = activeData.started_at || activeData.start_time;
                if (restoredStart) startTimer(restoredStart);
              }
            }
          } catch (error) {
            console.error("Failed to reload active entry after start:", error);
          }
        }

        if (pendingStream && resolvedEntryId) {
          try {
            await beginScreenshotMonitoring(pendingStream, resolvedEntryId);
            pendingStream = null;
            showToast("Timer started and screenshot monitoring is active!", "success");
          } catch (error) {
            stopMediaStream(pendingStream);
            pendingStream = null;

            try {
              await fetch(getApiUrl("/api/entries/stop/"), {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include",
              });
            } catch (stopError) {
              console.error("Failed to stop timer after screenshot setup error:", stopError);
            }

            resetActiveTimerUi("ended");
            void fetchTimeEntries();
            throw error;
          }
        } else {
          if (pendingStream) {
            stopMediaStream(pendingStream);
            pendingStream = null;
          }
          setScreenshotStatus("ended");
          showToast(
            "Timer started, but screenshot monitoring could not be attached to the active entry.",
            "error"
          );
        }
      } else {
        if (pendingStream) {
          stopMediaStream(pendingStream);
          pendingStream = null;
        }
        console.error("Start timer error:", data);
        showToast(extractErrorMessage(data, "Failed to start timer"), "error");
      }
    } catch (error) {
      if (pendingStream) {
        stopMediaStream(pendingStream);
      }
      console.error("Error starting timer:", error);
      showToast(error instanceof Error ? error.message : "Error starting timer", "error");
      setScreenshotStatus("ended");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleStop = async () => {
    if (isActionPending) return;
    if (stopRequestInFlightRef.current) return;
    setIsActionPending(true);
    stopRequestInFlightRef.current = true;

    try {
      stopScreenshotMonitoring();

      const response = await fetch(getApiUrl("/api/entries/stop/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        resetActiveTimerUi("idle");
        void fetchTimeEntries();
        showToast("Timer stopped and saved!", "success");
      } else {
        const errorText = await readErrorMessage(response, "Failed to stop timer");
        const backendAlreadyStopped =
          response.status === 400 &&
          /no active|not running|already stopped|no running/i.test(errorText);

        if (backendAlreadyStopped) {
          resetActiveTimerUi("ended");
          void fetchTimeEntries();
          showToast("The timer was already stopped after screen sharing ended.", "info");
        } else {
          console.error("Stop timer error:", errorText);
          showToast(errorText, "error");
        }
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      showToast("Error stopping timer", "error");
    } finally {
      setIsActionPending(false);
      stopRequestInFlightRef.current = false;
    }
  };

  const handleEnableScreenshots = async () => {
    if (!activeEntryId) {
      showToast("Start a timer before enabling screenshots.", "error");
      return;
    }

    try {
      await enableScreenshotsForActiveEntry(activeEntryId);
    } catch (error) {
      console.error("Enable screenshots error:", error);
      showToast(error instanceof Error ? error.message : "Failed to enable screenshots", "error");
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

      const response = await fetch(getApiUrl("/api/projects/"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([...projects, data]);
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
    try {
      const entryProjectId =
        (entry as any).project?.id ?? (entry as any).project ?? (entry as any).project_id ?? null;
      if (entryProjectId && !projects.some((project) => project.id === entryProjectId)) {
        await fetchProjects();
      }
    } catch (error) {
      console.error("Failed to refresh projects before edit:", error);
    }

    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (entryId: number, updates: Partial<TimeEntry>) => {
    try {
      const response = await fetch(getApiUrl(`/api/entries/${entryId}/`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        void fetchTimeEntries();
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
      const response = await fetch(getApiUrl(`/api/entries/${id}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        setTimeEntries(timeEntries.filter((entry) => entry.id !== id));
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

  if (!isEmployeeAllowed) {
    return null;
  }

  return (
    <div className="employee-page">
      <div className="app-shell">
        <section className="employee-hero rounded-4xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">Employee workspace</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Time tracker</h1>
              <p className="mt-3 text-base text-slate-600">
                Log focused work, keep entries organized, and maintain a clean audit trail for your day.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mode</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{isRunning ? "Running" : "Idle"}</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Projects</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{projects.length}</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Entries</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{timeEntries.length}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
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
            isActionPending={isActionPending}
            screenshotStatus={screenshotStatus}
            lastScreenshotLabel={lastScreenshotAt}
            onStart={handleStart}
            onStop={handleStop}
            onAddProject={() => setShowProjectModal(true)}
            onEnableScreenshots={handleEnableScreenshots}
          />

          <TimeEntriesTable
            entries={currentEntries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

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
