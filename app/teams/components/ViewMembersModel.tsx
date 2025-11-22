import { useState, useEffect } from "react";
import { Team, TeamMember } from "../index/type";
import { Button } from "../../components/Button";

interface ViewMembersModalProps {
  isOpen: boolean;
  team: Team | null;
  members: TeamMember[];
  currentUserId?: number;
  onClose: () => void;
  onRemoveMember?: (teamId: number, userId: number) => Promise<void>;
}

export function ViewMembersModal({
  isOpen,
  team,
  members,
  currentUserId,
  onClose,
  onRemoveMember,
}: ViewMembersModalProps) {
  if (!isOpen || !team) return null;

  console.log("ViewMembersModal - Team:", team);
  console.log("ViewMembersModal - Members:", members);

  // Check if current user is the owner
  const currentId = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;
  const ownerId = typeof team.owner?.id === 'string' ? parseInt(team.owner.id, 10) : team.owner?.id;
  const isOwner = currentId === ownerId;

  // Separate owner and members
  const ownerMember = members.find((m) => m.role === 'owner');
  const regularMembers = members.filter((m) => m.role === 'member');

  console.log("Owner member:", ownerMember);
  console.log("Regular members:", regularMembers);

  const handleRemoveMember = async (userId: number) => {
    if (!onRemoveMember || !team) return;
    if (confirm("Are you sure you want to remove this member from the team?")) {
      try {
        await onRemoveMember(team.id, userId);
      } catch (error) {
        console.error("Error removing member:", error);
        alert("Failed to remove member. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[600px] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {team.name} Members
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Show Owner Section */}
          {ownerMember && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Owner</div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                <div>
                  <div className="font-medium text-gray-900">
                    {ownerMember.username || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ownerMember.email || 'No email'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Owner
                  </span>
                  <div className="text-xs text-gray-400">
                    {new Date(ownerMember.joined_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show Members Section */}
          {regularMembers.length > 0 ? (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Members ({regularMembers.length})
              </div>
              <div className="space-y-2">
                {regularMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.username || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email || 'No email'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                          Member
                        </span>
                        <div className="text-xs text-gray-400">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                      {isOwner && onRemoveMember && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove member"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {ownerMember ? "No other members in this team" : "No members in this team"}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}