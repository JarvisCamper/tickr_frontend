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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onCreate()}
          placeholder="Project name"
          className="w-full px-4 py-2 border rounded-md mb-4 text-black"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={onCreate}
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}