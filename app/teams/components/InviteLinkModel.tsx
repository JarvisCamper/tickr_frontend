// teams/components/InviteLinkModal.tsx
import { Team } from "../index/type";

interface InviteLinkModalProps {
  isOpen: boolean;
  team: Team | null;
  invitationLink: string;
  onClose: () => void;
  onCopy: () => void;
  onEmail: () => void;
}

export function InviteLinkModal({
  isOpen,
  team,
  invitationLink,
  onClose,
  onCopy,
  onEmail,
}: InviteLinkModalProps) {
  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Invitation Link Ready!</h2>

        <p className="text-gray-600 mb-4">
          Share this link with people you want to invite to <strong>{team.name}</strong>. They'll
          need to login to accept the invitation.
        </p>

        <div className="bg-gray-50 p-3 rounded-md mb-4 break-all text-sm font-mono">
          {invitationLink}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onCopy}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Link
          </button>
          <button
            onClick={onEmail}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}