"use client";

import React from 'react';
import { Project } from '../types';

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
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddProject: () => void;
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
  onStart,
  onPause,
  onResume,
  onStop,
  onAddProject,
}: TimerControlProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on? *"
          className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          >
            <option value="">No project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <button
            onClick={onAddProject}
            className="px-3 py-3 text-blue-600 hover:bg-blue-50 rounded-md"
          >
            + New Project
          </button>
        </div>

        <div className="text-2xl font-mono font-semibold text-gray-900 min-w-[120px] text-center">
          {formatTime(time)}
        </div>

        {!isRunning ? (
          <button
            onClick={onStart}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-md transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}