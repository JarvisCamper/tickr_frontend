'use client';

import { useState, useEffect } from 'react';
import { TimeEntry, Project } from '../types';

interface EditEntryModalProps {
  isOpen: boolean;
  entry: TimeEntry | null;
  projects: Project[];
  onClose: () => void;
  onSave: (entryId: number, updates: Partial<TimeEntry>) => Promise<void>;
}

export function EditEntryModal({
  isOpen,
  entry,
  projects,
  onClose,
  onSave,
}: EditEntryModalProps) {
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setDescription(entry.description || '');
      // Support entry.project being an object or a numeric id field `project_id`
      const projId = (entry as any).project?.id ?? (entry as any).project ?? (entry as any).project_id ?? null;
      setProjectId(typeof projId === 'number' ? projId : null);
      
      if (entry.start_time) {
        const start = new Date(entry.start_time);
        setStartTime(formatDateTimeLocal(start));
      }
      
      if (entry.end_time) {
        const end = new Date(entry.end_time);
        setEndTime(formatDateTimeLocal(end));
      }
    }
  }, [entry]);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSave = async () => {
    if (!entry) return;

    // Client-side validation: prevent end before start and missing start when end provided
    setValidationError(null);
    if (endTime && !startTime) {
      setValidationError('Please provide a start time when specifying an end time.');
      return;
    }
    if (startTime && endTime) {
      const s = new Date(startTime).getTime();
      const e = new Date(endTime).getTime();
      if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
        setValidationError('End time must be after start time.');
        return;
      }
    }

    setLoading(true);
    try {
      const updates: any = {
        description,
        project_id: projectId,
      };

      if (startTime) {
        updates.start_time = new Date(startTime).toISOString();
      }
      
      if (endTime) {
        updates.end_time = new Date(endTime).toISOString();
      }

      await onSave(entry.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Time Entry</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          {validationError && (
            <div className="w-full text-sm text-red-600 mb-2">{validationError}</div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}