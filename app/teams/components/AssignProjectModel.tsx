// teams/components/AssignProjectModal.tsx
import { useEffect, useState } from "react";
import { Team, Project } from "../index/type";

interface AssignProjectModalProps {
  isOpen: boolean;
  team: Team | null;
  projects: Project[];
  onClose: () => void;
  onAssign: (teamId: number, projectId: number) => Promise<boolean>;
  isLoading: boolean;
}

export function AssignProjectModal({
  isOpen,
  team,
  projects,
  onClose,
  onAssign,
  isLoading,
}: AssignProjectModalProps) {
  const PROJECTS_PER_PAGE = 10;
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen || !team) return null;

  const unassignedProjects = projects.filter(
    (p) => p.type === "group" && !(p.team_id || p.team?.id)
  );
  const totalPages = Math.max(1, Math.ceil(unassignedProjects.length / PROJECTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProjects = unassignedProjects.slice(
    pageStart,
    pageStart + PROJECTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
    setSelectedProjectId(null);
  }, [team?.id, isOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleAssign = async () => {
    if (!selectedProjectId || !team) return;
    
    try {
      setAssigning(true);
      // Correct order: teamId first, then projectId
      const success = await onAssign(team.id, selectedProjectId);
      if (success) {
        setSelectedProjectId(null);
        onClose();
      }
    } catch (error) {
      console.error("Failed to assign project:", error);
      // You might want to show an error toast here
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedProjectId(null);
    setCurrentPage(1);
    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-card-strong w-full max-w-md rounded-[1.6rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">Assign project to {team.name}</h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Select Project *</label>
          {unassignedProjects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
              Only unassigned group projects are shown here. Create a group project, or unassign one from another team first.
            </div>
          ) : (
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="pro-select"
            >
              <option value="">-- Select a project --</option>
              {paginatedProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {unassignedProjects.length > PROJECTS_PER_PAGE && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Showing {pageStart + 1}-{Math.min(pageStart + PROJECTS_PER_PAGE, unassignedProjects.length)} of {unassignedProjects.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="rounded-xl bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safeCurrentPage === totalPages}
                className="rounded-xl bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAssign}
            disabled={isLoading || assigning || !selectedProjectId}
            className="flex-1 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            {assigning ? "Assigning..." : "Assign Project"}
          </button>
          <button
            onClick={handleClose}
            disabled={assigning}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
