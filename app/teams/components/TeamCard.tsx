// teams/components/TeamCard.tsx
import { Team, Project } from "../index/type";

interface TeamCardProps {
  team: Team;
  projects: Project[];
  onViewMembers: (team: Team) => void;
  onViewProjects: (team: Team) => void;
  onInvite: (team: Team) => void;
  onAssignProject: (team: Team) => void;
  onDelete: (teamId: number) => void;
}

export function TeamCard({
  team,
  projects,
  onViewMembers,
  onViewProjects,
  onInvite,
  onAssignProject,
  onDelete,
}: TeamCardProps) {
  const assignedProjects = projects.filter((p) => p.team_id === team.id);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
        <button
          onClick={() => onDelete(team.id)}
          className="text-red-500 hover:text-red-700"
          title="Delete team"
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
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {team.description || "No description"}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {team.member_count} {team.member_count === 1 ? "member" : "members"}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {assignedProjects.length} {assignedProjects.length === 1 ? "project" : "projects"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => onViewMembers(team)}
          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          Members
        </button>
        <button
          onClick={() => onViewProjects(team)}
          className="bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition-colors text-sm"
        >
          Projects
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onInvite(team)}
          className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
        >
          Invite
        </button>
        <button
          onClick={() => onAssignProject(team)}
          className="bg-green-100 text-green-700 px-3 py-2 rounded-md hover:bg-green-200 transition-colors text-sm"
        >
          Assign Project
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Created {new Date(team.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}