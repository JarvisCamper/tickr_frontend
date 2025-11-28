// teams/components/AssignProjectModal.tsx
import { useState } from "react";
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
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  if (!isOpen || !team) return null;

  const unassignedProjects = projects.filter((p) => !p.team_id || p.type === "individual");

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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Assign Project to {team.name}</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Project *</label>
          {unassignedProjects.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 text-center">
              No available projects to assign. Create a project first!
            </div>
          ) : (
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a project --</option>
              {unassignedProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAssign}
            disabled={isLoading || assigning || !selectedProjectId}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {assigning ? "Assigning..." : "Assign Project"}
          </button>
          <button
            onClick={handleClose}
            disabled={assigning}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}