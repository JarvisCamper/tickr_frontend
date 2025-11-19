// teams/components/ViewProjectsModal.tsx
import { Team, Project } from "../index/type";

interface ViewProjectsModalProps {
  isOpen: boolean;
  team: Team | null;
  projects: Project[];
  onClose: () => void;
  onUnassign: (projectId: number) => void;
}

export function ViewProjectsModal({
  isOpen,
  team,
  projects,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{team.name} - Projects</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
          <div className="text-center py-8 text-gray-500">
            No projects assigned to this team yet
          </div>
        ) : (
          <div className="space-y-3">
            {teamProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-500 mt-1">{project.description}</div>
                  )}
                </div>
                <button
                  onClick={() => handleUnassign(project.id)}
                  className="ml-4 text-red-500 hover:text-red-700 text-sm"
                  title="Unassign project"
                >
                  Unassign
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}