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
        project: projectId,
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
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-card-strong w-full max-w-2xl rounded-[1.6rem] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-950">Edit time entry</h2>
        <p className="mt-2 text-sm text-slate-600">Adjust the task, project, or timestamps for this saved session.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="pro-textarea"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Project
            </label>
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
              className="pro-select"
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="pro-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="pro-input"
            />
          </div>
        </div>

        {validationError && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {validationError}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
