// teams/components/ViewProjectsModal.tsx
import { Team, Project } from "../index/type";

interface ViewProjectsModalProps {
  isOpen: boolean;
  team: Team | null;
  projects: Project[];
  currentUserId?: number | null;
  onClose: () => void;
  onUnassign: (projectId: number) => void;
}

export function ViewProjectsModal({
  isOpen,
  team,
  projects,
  currentUserId,
  onClose,
  onUnassign,
}: ViewProjectsModalProps) {
  if (!isOpen || !team) return null;

  const teamProjects = projects.filter((p) => p.team_id === team.id);

  const handleUnassign = (projectId: number) => {
    if (confirm("Unassign this project from the team?")) {
      onUnassign(projectId);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-card-strong max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-[1.6rem] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-950">{team.name} - Projects</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {teamProjects.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No projects assigned to this team yet
          </div>
        ) : (
          <div className="space-y-3">
            {teamProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{project.name}</div>
                  {project.description && (
                    <div className="mt-1 text-sm text-slate-500">{project.description}</div>
                  )}
                </div>
                {team && team.owner && currentUserId === team.owner.id ? (
                  <button
                    onClick={() => handleUnassign(project.id)}
                    className="ml-4 rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    title="Unassign project"
                  >
                    Unassign
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
