
import React from 'react';
import { TimeEntry } from '../types'; 

interface TimeEntriesTableProps {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;  // Opens modal
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Helper function to format duration properly
function formatDuration(durationStr: string | null): string {
  if (!durationStr) return '00:00:00';
  
  // If already formatted, return as is
  if (durationStr.includes(':')) {
    // guard against negative formatted durations in -ve cases
    if (durationStr.trim().startsWith('-')) {
      return '00:00:00';
    }
    return durationStr;
  }
  
  // Parse as seconds and format
  let totalSeconds = parseFloat(durationStr);
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Helper to format datetime
function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function TimeEntriesTable({
  entries,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: TimeEntriesTableProps) {
  return (
    <section className="table-shell">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">Recent time entries</h2>
          <p className="section-subtitle">Review, edit, or remove logged work from your latest sessions.</p>
        </div>
        <div className="stat-pill">{entries.length} entries on this page</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Project</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Start</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">End</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-14">
                  <div className="empty-panel rounded-[1.25rem] px-6 py-10 text-center">
                    <div className="text-lg font-semibold text-slate-900">No time entries yet</div>
                    <div className="mt-2 text-sm text-slate-500">Start a timer to build your first work log.</div>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="font-semibold">{entry.description || 'Untitled work'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {entry.project_name || "No project"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatDateTime(entry.start_time)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatDateTime(entry.end_time)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {entry.duration_str || formatDuration(entry.duration)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 px-6 py-5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentPage === i + 1
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
