// teams/components/CreateTeamModal.tsx
import { useState } from "react";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<boolean>;
  isLoading: boolean;
  title?: string;
  descriptionText?: string;
  submitLabel?: string;
  initialName?: string;
  initialDescription?: string;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreate,
  isLoading,
  title = "Create new team",
  descriptionText = "Set up a team with a clear name and an optional working description.",
  submitLabel = "Create Team",
  initialName = "",
  initialDescription = "",
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState(initialName);
  const [teamDescription, setTeamDescription] = useState(initialDescription);
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
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-card-strong w-full max-w-md rounded-[1.6rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{descriptionText}</p>

        <div className="mb-4 mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Team Name </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="pro-input"
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description (Optional)
          </label>
          <textarea
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Enter team description"
            rows={3}
            className="pro-textarea"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={creating || !teamName.trim()}
            className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? `${submitLabel}...` : submitLabel}
          </button>
          
          <button
            onClick={handleClose}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
