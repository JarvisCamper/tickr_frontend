"use client";

import React from "react";

interface TimerControlProps {
  description: string;
  setDescription: (val: string) => void;
  selectedProjectId: number | null;
  setSelectedProjectId: (val: number | null) => void;
  projects: any[];
  time: number;
  formatTime: (seconds: number) => string;
  isRunning: boolean;
  isPaused: boolean;
  isActionPending: boolean;
  screenshotStatus: "idle" | "requesting" | "active" | "ended" | "unsupported";
  lastScreenshotLabel: string | null;
  onStart: () => void;
  onStop: () => void;
  onAddProject: () => void;
  onEnableScreenshots: () => void;
}

export function TimeControl({
  description,
  setDescription,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  time,
  formatTime,
  isRunning,
  isPaused,
  isActionPending,
  screenshotStatus,
  lastScreenshotLabel,
  onStart,
  onStop,
  onAddProject,
  onEnableScreenshots,
}: TimerControlProps) {
  const screenshotStatusLabel = {
    idle: "Screen capture inactive",
    requesting: "Waiting for screen permission",
    active: "Screenshots active",
    ended: "Screen share stopped",
    unsupported: "Browser capture unavailable",
  }[screenshotStatus];

  return (
    <section className="surface-card rounded-[1.75rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Current session</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Track work with less friction</h2>
          <p className="mt-1 text-sm text-slate-600">Capture what you are doing, connect it to a project, and keep the timer in sync.</p>
        </div>
        <div className="rounded-3xl bg-slate-950 px-6 py-4 text-center text-white shadow-lg shadow-slate-900/10">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Elapsed</div>
          <div className="mt-2 min-w-[150px] text-3xl font-semibold tracking-[0.18em] text-white">
            {formatTime(time)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Task description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="pro-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Project</label>
          <div className="flex gap-2">
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              className="pro-select"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              onClick={onAddProject}
              className="inline-flex h-[50px] items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              New
            </button>
          </div>
        </div>

        <div className="flex items-end">
          {!isRunning ? (
            <button
              onClick={onStart}
              disabled={isActionPending}
              className="inline-flex h-[50px] w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300 lg:w-auto"
            >
              Start timer
            </button>
          ) : (
            <button
              onClick={onStop}
              disabled={isActionPending}
              className="inline-flex h-[50px] w-full items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 lg:w-auto"
            >
              Stop and save
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="stat-pill">{isRunning ? "Timer running" : "Ready to start"}</span>
        <span className="stat-pill">{projects.length} available projects</span>
        <span className="stat-pill">{isPaused ? "Paused locally" : "Synced live"}</span>
        <span className="stat-pill">{screenshotStatusLabel}</span>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Monitoring notice</p>
        <p className="mt-1">
          Starting a tracked session will request screen sharing, take one screenshot immediately, and continue every 10 minutes while the timer is running.
        </p>
        {lastScreenshotLabel ? (
          <p className="mt-2 text-xs font-medium text-slate-500">Last screenshot: {lastScreenshotLabel}</p>
        ) : null}
        {isRunning && screenshotStatus !== "active" ? (
          <button
            onClick={onEnableScreenshots}
            className="mt-3 inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Enable screenshots
          </button>
        ) : null}
      </div>
    </section>
  );
}
