//app/teams/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context-and-provider";
import { useTeams } from "./hooks/useTeams";
import { Team } from "./index/type";
import { useEmployeeRouteGuard } from "@/app/hooks/useEmployeeRouteGuard";
import { PaginationControls } from "@/app/components/PaginationControls";

// Components
import { TeamCard } from "./components/TeamCard";
import { CreateTeamModal } from "./components/CreateTeamModel";
import { InviteOptionsModal } from "./components/InviteOptionsModel";
import { InviteLinkModal } from "./components/InviteLinkModel";
import { ViewMembersModal } from "./components/ViewMembersModel";
import { ViewProjectsModal } from "./components/ViewProjectsModel";
import { AssignProjectModal } from "./components/AssignProjectModel";

export default function TeamsPage() {
  const { isLoading: authLoading, isEmployeeAllowed, user } = useEmployeeRouteGuard();
  const { showToast } = useToast();
  
  console.log("TeamsPage - Current user:", user);
  
  const {
    teams,
    projects,
    teamMembers,
    isLoading,
    fetchTeams,
    fetchProjects,
    fetchTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    generateInviteLink,
    assignProject,
    unassignProject,
    removeTeamMember,
  } = useTeams();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteOptionsModal, setShowInviteOptionsModal] = useState(false);
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Selected team state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [invitationLink, setInvitationLink] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const TEAMS_PER_PAGE = 9;

  useEffect(() => {
    if (isEmployeeAllowed) {
      // Fetch teams and projects in parallel for faster loading
      Promise.all([fetchTeams(), fetchProjects()]);
    }
  }, [isEmployeeAllowed, fetchTeams, fetchProjects]);

  const handleCreateTeam = async (name: string, description: string): Promise<boolean> => {
    try {
      await createTeam(name, description);
      showToast("Team created successfully!", "success");
      await fetchTeams(); // Refresh teams list
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to create team", "error");
      return false;
    }
  };

  const handleUpdateTeam = async (name: string, description: string): Promise<boolean> => {
    if (!selectedTeam) return false;

    try {
      await updateTeam(selectedTeam.id, name, description);
      showToast("Team updated successfully!", "success");
      await fetchTeams();
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to update team", "error");
      return false;
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      try {
        await deleteTeam(teamId);
        showToast("Team deleted successfully", "success");
      } catch {
        showToast("Failed to delete team", "error");
      }
    }
  };

  const handleViewMembers = async (team: Team) => {
    setSelectedTeam(team);
    await fetchTeamMembers(team.id);
    setShowMembersModal(true);
  };

  const handleViewProjects = (team: Team) => {
    setSelectedTeam(team);
    setShowProjectsModal(true);
  };

  const handleInvite = (team: Team) => {
    setSelectedTeam(team);
    setShowInviteOptionsModal(true);
  };

  const handleGenerateLink = async () => {
    if (!selectedTeam) return;
    try {
      setShowInviteOptionsModal(false);
      const link = await generateInviteLink(selectedTeam.id);
      if (link) {
        setInvitationLink(link);
        setShowInviteLinkModal(true);
      }
    } catch {
      showToast("Failed to generate invite link", "error");
    }
  };

  const handleAssignProject = (team: Team) => {
    setSelectedTeam(team);
    setShowAssignModal(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  // Wrapper for assignProject with better error handling
  const handleAssignProjectSubmit = async (teamId: number, projectId: number) => {
    console.log(" handleAssignProjectSubmit called with:", { teamId, projectId });
    try {
      const result = await assignProject(teamId, projectId);
      console.log(" Assignment result:", result);
      
      // Refresh BOTH teams and projects to update the UI
      console.log(" Refreshing teams and projects...");
      await Promise.all([fetchTeams(), fetchProjects()]);
      console.log(" Refresh complete - Teams:", teams.length, "Projects:", projects.length);
      
      showToast("Project assigned successfully!", "success");
      return result;
    } catch (error) {
      console.error(" Assignment failed:", error);
      showToast(error instanceof Error ? error.message : "Failed to assign project", "error");
      throw error;
    }
  };

  // Wrapper for unassignProject with better error handling
  const handleUnassignProject = async (teamId: number, projectId: number) => {
    try {
      await unassignProject(teamId, projectId);
      showToast("Project unassigned successfully!", "success");
      await fetchProjects();
    } catch {
      showToast("Failed to unassign project", "error");
    }
  };

  const handleRemoveMember = async (teamId: number, userId: number) => {
    try {
      await removeTeamMember(teamId, userId);
      await fetchTeamMembers(teamId);
      showToast("Member removed successfully", "success");
    } catch {
      showToast("Failed to remove member", "error");
    }
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    showToast("Link copied to clipboard!", "success");
  };

  const shareViaEmail = () => {
    const subject = `Join ${selectedTeam?.name} on Tickr`;
    const body = `You've been invited to join "${selectedTeam?.name}".\n\nClick this link:\n${invitationLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const totalPages = Math.max(1, Math.ceil(teams.length / TEAMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTeams = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * TEAMS_PER_PAGE;
    return teams.slice(startIndex, startIndex + TEAMS_PER_PAGE);
  }, [teams, safeCurrentPage]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isEmployeeAllowed) return null;

  return (
    <div className="employee-page">
      <div className="app-shell">
        <section className="employee-hero rounded-4xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">Team collaboration</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Teams</h1>
              <p className="mt-3 text-base text-slate-600">
                Create focused teams, assign projects cleanly, and manage members from one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total teams</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{teams.length}</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assigned projects</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{projects.filter((project) => project.team_id).length}</div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-[1.4rem] bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create team
              </button>
            </div>
          </div>
        </section>

        {/* Teams Grid */}
        <div className="mt-8">
        {isLoading && teams.length === 0 ? (
          <div className="surface-card rounded-[1.75rem] px-6 py-16 text-center text-slate-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="empty-panel rounded-[1.75rem] px-6 py-16 text-center">
            <div className="mb-4 text-lg font-semibold text-slate-900">No teams yet</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create your first team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                projects={projects}
                currentUserId={user?.id}
                onViewMembers={handleViewMembers}
                onViewProjects={handleViewProjects}
                onInvite={handleInvite}
                onAssignProject={handleAssignProject}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
              />
            ))}
          </div>
        )}

        <PaginationControls
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={teams.length}
          pageSize={TEAMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="teams"
        />
        </div>

        {/* Modals */}
        <CreateTeamModal
          key="create-team"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTeam}
          isLoading={isLoading}
        />

        <CreateTeamModal
          key={`edit-team-${selectedTeam?.id || "none"}`}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onCreate={handleUpdateTeam}
          isLoading={isLoading}
          title={`Edit ${selectedTeam?.name || "team"}`}
          descriptionText="Update the team name and description. Only the team owner can save these changes."
          submitLabel="Save Changes"
          initialName={selectedTeam?.name || ""}
          initialDescription={selectedTeam?.description || ""}
        />

        <InviteOptionsModal
          isOpen={showInviteOptionsModal}
          team={selectedTeam}
          onClose={() => setShowInviteOptionsModal(false)}
          onGenerateLink={handleGenerateLink}
          isLoading={isLoading}
        />

        <InviteLinkModal
          isOpen={showInviteLinkModal}
          team={selectedTeam}
          invitationLink={invitationLink}
          onClose={() => setShowInviteLinkModal(false)}
          onCopy={copyInvitationLink}
          onEmail={shareViaEmail}
        />

        <ViewMembersModal
          isOpen={showMembersModal}
          team={selectedTeam}
          members={teamMembers}
          currentUserId={user?.id}
          onClose={() => setShowMembersModal(false)}
          onRemoveMember={handleRemoveMember}
        />

        <ViewProjectsModal
          isOpen={showProjectsModal}
          team={selectedTeam}
          projects={projects}
          currentUserId={user?.id}
          onClose={() => setShowProjectsModal(false)}
          onUnassign={(projectId) => selectedTeam && handleUnassignProject(selectedTeam.id, projectId)}
        />

        <AssignProjectModal
          key={`assign-project-${selectedTeam?.id || "none"}-${showAssignModal ? "open" : "closed"}`}
          isOpen={showAssignModal}
          team={selectedTeam}
          projects={projects}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignProjectSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
