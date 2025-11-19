import React from 'react';
import { TimeEntry } from '../types'; 

interface TimeEntriesTableProps {
  entries: TimeEntry[];
  editingEntry: number | null;
  editDescription: string;
  setEditDescription: (val: string) => void;
  onEdit: (entry: TimeEntry) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TimeEntriesTable({
  entries,
  editingEntry,
  editDescription,
  setEditDescription,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: TimeEntriesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">My Time Entries</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Project</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No time entries yet. Start tracking your time!
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {editingEntry === entry.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-black"
                      />
                    ) : (
                      entry.description
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.project?.name || "No project"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{entry.start_time}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{entry.end_time || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{entry.duration}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    {editingEntry === entry.id ? (
                      <>
                        <button
                          onClick={() => onSaveEdit(entry.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(entry)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`px-4 py-2 rounded-md ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}