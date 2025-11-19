"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context-and-provider/AuthContext";
import { useToast } from "../../context-and-provider";
import { useTeams } from "./hooks/useTeams";
import { Team } from "./index/type";

// Components
import { TeamCard } from "./components/TeamCard";
import { CreateTeamModal } from "./components/CreateTeamModel";
import { InviteOptionsModal } from "./components/InviteOptionsModel";
import { InviteLinkModal } from "./components/InviteLinkModel";
import { ViewMembersModal } from "./components/ViewMembersModel";
import { ViewProjectsModal } from "./components/ViewProjectsModel";
import { AssignProjectModal } from "./components/AssignProjectModel";

export default function TeamsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const {
    teams,
    projects,
    teamMembers,
    isLoading,
    fetchTeams,
    fetchProjects,
    fetchTeamMembers,
    createTeam,
    deleteTeam,
    generateInviteLink,
    assignProject,
    unassignProject,
  } = useTeams();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteOptionsModal, setShowInviteOptionsModal] = useState(false);
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Selected team state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [invitationLink, setInvitationLink] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
      fetchProjects();
    }
  }, [isAuthenticated]);

  const handleDeleteTeam = async (teamId: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      await deleteTeam(teamId);
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
    setShowInviteOptionsModal(false);
    const link = await generateInviteLink(selectedTeam.id);
    if (link) {
      setInvitationLink(link);
      setShowInviteLinkModal(true);
    }
  };

  const handleAssignProject = (team: Team) => {
    setSelectedTeam(team);
    setShowAssignModal(true);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            + Create Team
          </button>
        </div>

        {/* Teams Grid */}
        {isLoading && teams.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No teams yet</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-500 hover:text-blue-600"
            >
              Create your first team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                projects={projects}
                onViewMembers={handleViewMembers}
                onViewProjects={handleViewProjects}
                onInvite={handleInvite}
                onAssignProject={handleAssignProject}
                onDelete={handleDeleteTeam}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <CreateTeamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={createTeam}
          isLoading={isLoading}
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
          onClose={() => setShowMembersModal(false)}
        />

        <ViewProjectsModal
          isOpen={showProjectsModal}
          team={selectedTeam}
          projects={projects}
          onClose={() => setShowProjectsModal(false)}
          onUnassign={unassignProject}
        />

        <AssignProjectModal
          isOpen={showAssignModal}
          team={selectedTeam}
          projects={projects}
          onClose={() => setShowAssignModal(false)}
          onAssign={assignProject}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}