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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Invite to {team.name}</h2>

        <p className="text-gray-600 mb-6 text-sm">
          Generate an invitation link to share with anyone you want to invite to this team.
        </p>

        <button
          onClick={onGenerateLink}
          disabled={isLoading}
          className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <svg
                className="w-6 h-6 text-green-600"
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
              <div className="font-semibold text-gray-900">Generate Invite Link</div>
              <div className="text-sm text-gray-500">Share link via email or message</div>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}