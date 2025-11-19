// teams/components/ViewMembersModal.tsx
import { Team, TeamMember } from "../index/type";

interface ViewMembersModalProps {
  isOpen: boolean;
  team: Team | null;
  members: TeamMember[];
  onClose: () => void;
}

export function ViewMembersModal({ isOpen, team, members, onClose }: ViewMembersModalProps) {
  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{team.name} - Members</h2>
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

        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No members yet</div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">{member.user.username}</div>
                  <div className="text-sm text-gray-500">{member.user.email}</div>
                </div>
                <div className="text-xs text-gray-400">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </div>
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