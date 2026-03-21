import { Team, Project } from "../index/type";
import { Button } from "../../components/Button";
import { memo } from "react";

interface TeamCardProps {
  team: Team;
  projects: Project[];
  currentUserId?: number;
  onViewMembers: (team: Team) => void;
  onViewProjects: (team: Team) => void;
  onInvite: (team: Team) => void;
  onAssignProject: (team: Team) => void;
  onEdit: (team: Team) => void;
  onDelete: (teamId: number) => void;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  // Add ordinal suffix (st, nd, rd, th)
  const suffix = 
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  
  return `${day}${suffix} ${month}, ${year}`;
}

const TeamCardComponent = ({
  team,
  projects,
  currentUserId,
  onViewMembers,
  onViewProjects,
  onInvite,
  onAssignProject,
  onEdit,
  onDelete,
}: TeamCardProps) => {
  // Filter projects assigned to this team - handle both team_id and team object
  const assignedProjects = projects.filter((p) => {
    const teamId = p.team_id || p.team?.id;
    return teamId === team.id;
  });
  
  // Ensure both IDs are numbers for comparison
  const currentId = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;
  const ownerId = typeof team.owner?.id === 'string' ? parseInt(team.owner.id, 10) : team.owner?.id;
  const isOwner = currentId === ownerId;

  return (
    <div className="surface-card rounded-[1.6rem] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{team.name}</h3>
          {!isOwner && (
            <p className="mt-1 text-xs font-medium text-slate-400">Member access</p>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(team.id)}
            className="rounded-full border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
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
        )}
      </div>

      <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-600">
        {team.description || "No description"}
      </p>

      <div className="mb-5 grid gap-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center text-sm text-slate-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>{team.member_count}</span>{" "}
          <span>{team.member_count === 1 ? "member" : "members"}</span>
        </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center text-sm text-slate-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{assignedProjects.length}</span>{" "}
          <span>{assignedProjects.length === 1 ? "project" : "projects"}</span>
        </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center text-sm text-slate-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="ml-1">
            Created by <strong>{team.owner?.username || "Unknown"}</strong>
          </span>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewMembers(team)}
        >
          Members
        </Button>
        <Button
          variant="purple-light"
          size="sm"
          onClick={() => onViewProjects(team)}
        >
          Projects
        </Button>
      </div>

      {isOwner && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="blue-light"
            size="sm"
            onClick={() => onInvite(team)}
          >
            Invite
          </Button>
          <Button
            variant="green-light"
            size="sm"
            onClick={() => onAssignProject(team)}
          >
            Assign Project
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(team)}
          >
            Edit Team
          </Button>
        </div>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        Created {formatDate(team.created_at)}
      </div>
    </div>
  );
};

export const TeamCard = memo(TeamCardComponent);
