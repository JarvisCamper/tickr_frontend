"use client";

import React from 'react';

interface TimerControlProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  selectedProjectId: number | null;
  onProjectChange: (val: number | null) => void;
  projects: any[];
  time: number;
  formatTime: (seconds: number) => string;
  isRunning: boolean;
  isPaused: boolean;
  isActionPending: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddProject: () => void;
}

export function TimeControl({
  description,
  onDescriptionChange,
  selectedProjectId,
  onProjectChange,
  projects,
  time,
  formatTime,
  isRunning,
  isPaused,
  isActionPending,
  onStart,
  onStop,
  onAddProject,
}: TimerControlProps) {
  return (
    <section className="surface-card rounded-[1.75rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Current session</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Track work with less friction</h2>
          <p className="mt-1 text-sm text-slate-600">Capture what you are doing, connect it to a project, and keep the timer in sync.</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-950 px-6 py-4 text-center text-white shadow-lg shadow-slate-900/10">
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
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="What are you working on?"
            className="pro-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Project</label>
          <div className="flex gap-2">
            <select
              value={selectedProjectId || ""}
              onChange={(e) => onProjectChange(e.target.value ? Number(e.target.value) : null)}
              className="pro-select"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <button
              onClick={onAddProject}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
              className="w-full rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300 lg:w-auto"
            >
              Start timer
            </button>
          ) : (
            <button
              onClick={onStop}
              disabled={isActionPending}
              className="w-full rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 lg:w-auto"
            >
              Stop and save
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="stat-pill">{isRunning ? 'Timer running' : 'Ready to start'}</span>
        <span className="stat-pill">{projects.length} available projects</span>
        <span className="stat-pill">{isPaused ? 'Paused locally' : 'Synced live'}</span>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Session note</p>
        <p className="mt-1">
          Starting a tracked session will begin time tracking immediately for the selected task and project.
        </p>
      </div>
    </section>
  );
}
