// teams/components/CreateTeamModal.tsx
import { useState } from "react";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<boolean>;
  isLoading: boolean;
}

export function CreateTeamModal({ isOpen, onClose, onCreate, isLoading }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setCreating(true);
    const success = await onCreate(teamName, teamDescription);
    setCreating(false);
    if (success) {
      console.log("Team created successfully");
      setTeamName("");
      setTeamDescription("");
      onClose();
    }
  };

  const handleClose = () => {
    setTeamName("");
    setTeamDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Team</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Name </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Enter team description"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={creating || !teamName.trim()}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating..." : "Create Team"}
          </button>
          
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}