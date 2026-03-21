import React from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  projectName: string;
  setProjectName: (val: string) => void;
  onClose: () => void;
  onCreate: () => void;
  isLoading: boolean;
}

export function ProjectModal({
  isOpen,
  projectName,
  setProjectName,
  onClose,
  onCreate,
  isLoading,
}: ProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="surface-card-strong w-full max-w-md rounded-[1.6rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">Create a quick project</h2>
        <p className="mt-2 text-sm text-slate-600">Add a project without leaving the timer flow.</p>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onCreate()}
          placeholder="Project name"
          className="pro-input mt-5"
          autoFocus
        />
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCreate}
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
