// teams/components/InviteOptionsModal.tsx
import { Team } from "../index/type";

interface InviteOptionsModalProps {
  isOpen: boolean;
  team: Team | null;
  onClose: () => void;
  onGenerateLink: () => void;
  isLoading: boolean;
}

export function InviteOptionsModal({
  isOpen,
  team,
  onClose,
  onGenerateLink,
  isLoading,
}: InviteOptionsModalProps) {
  if (!isOpen || !team) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="surface-card-strong w-full max-w-md rounded-[1.6rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">Invite to {team.name}</h2>

        <p className="mb-6 text-sm text-slate-600">
          Generate an invitation link to share with anyone you want to invite to this team.
        </p>

        <button
          onClick={onGenerateLink}
          disabled={isLoading}
          className="group mb-4 flex w-full items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center">
            <div className="rounded-xl bg-emerald-100 p-3 transition-colors group-hover:bg-emerald-200">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <div className="font-semibold text-slate-900">Generate Invite Link</div>
              <div className="text-sm text-slate-500">Share link via email or message</div>
            </div>
          </div>
          <svg
            className="h-5 w-5 text-slate-400 group-hover:text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
