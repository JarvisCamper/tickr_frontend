// teams/hooks/useTeams.ts

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Team, TeamMember, Project } from "../index/type";
import { API_BASE_URL, getApiUrl } from "@/constant/apiendpoints";

const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }
  
  const token = Cookies.get("access_token");
  
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const checkAuth = () => {
  if (typeof window === "undefined") return false;
  const token = Cookies.get("access_token");
  if (!token) {
    throw new Error("Authentication required. Please log in again.");
  }
  return true;
};

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all teams
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(getApiUrl("teams/"), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }

      const data = await response.json();
      
      // Process teams to ensure owner is in members array
      const processedTeams = data.map((team: Team) => {
        if (!team.members) {
          team.members = [];
        }
        
        const ownerInMembers = team.members.some(m => m.user_id === team.owner.id);
        
        if (!ownerInMembers) {
          team.members.unshift({
            id: -1,
            user_id: team.owner.id,
            username: team.owner.username,
            email: team.owner.email,
            role: 'owner',
            joined_at: team.created_at
          });
        }
        
        return team;
      });
      
      // Try to fetch joined teams
      let allTeams = processedTeams;
      try {
        const joinedResponse = await fetch(getApiUrl("teams/joined/"), {
          headers: getAuthHeaders(),
        });
        
        if (joinedResponse.ok) {
          const joinedData = await joinedResponse.json();
          
          const processedJoined = joinedData.map((team: Team) => {
            if (!team.members) {
              team.members = [];
            }
            const ownerInMembers = team.members.some(m => m.user_id === team.owner.id);
            if (!ownerInMembers) {
              team.members.unshift({
                id: -1,
                user_id: team.owner.id,
                username: team.owner.username,
                email: team.owner.email,
                role: 'owner',
                joined_at: team.created_at
              });
            }
            return team;
          });
          
          const ownedIds = new Set(processedTeams.map((t: Team) => t.id));
          allTeams = [
            ...processedTeams,
            ...processedJoined.filter((t: Team) => !ownedIds.has(t.id))
          ];
        }
      } catch (err) {
        // Silently ignore if endpoint doesn't exist
      }
      
      setTeams(allTeams);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching teams:", err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("projects/"), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      
      // Normalize project data: extract team_id from team object if needed
      const normalizedProjects = data.map((p: any) => ({
        ...p,
        team_id: p.team_id !== undefined ? p.team_id : (p.team ? p.team.id : null),
        team: p.team || (p.team_id ? { id: p.team_id, name: p.team_name || '' } : null)
      }));
      
      console.log("📦 Projects fetched:", normalizedProjects.length);
      console.log("📦 ALL Projects data:", JSON.stringify(normalizedProjects, null, 2));
      console.log("📦 Projects with teams:", normalizedProjects.filter((p: Project) => p.team_id || p.team).map((p: Project) => ({
        id: p.id,
        name: p.name,
        team_id: p.team_id,
        team: p.team
      })));
      setProjects(normalizedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  }, []);

  // Create a new team
  const createTeam = async (name: string, description: string) => {
    try {
      checkAuth();
      
      const response = await fetch(getApiUrl("teams/"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create team");
      }

      const newTeam = await response.json();
      setTeams((prevTeams) => [...prevTeams, newTeam]);
      return newTeam;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  };

  // Delete a team
  const deleteTeam = async (teamId: number) => {
    try {
      const response = await fetch(getApiUrl(`teams/${teamId}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete team");
      }

      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  };

  // Generate invite link
  const generateInviteLink = async (teamId: number) => {
    try {
      const response = await fetch(getApiUrl(`teams/${teamId}/invite/`), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to generate invite link");
      }

      const data = await response.json();
      
      let inviteLink = data.invite_link || 
                       data.invitation_link || 
                       data.link || 
                       data.url ||
                       data.invitation_code ||
                       data.code;
      
      if (inviteLink && !inviteLink.includes('http') && !inviteLink.includes('/')) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        inviteLink = `${baseUrl}/teams/AcceptInvite/${inviteLink}`;
      } else if (inviteLink && !inviteLink.includes('http')) {
        inviteLink = inviteLink.replace('/teams/accept-invite/', '/teams/AcceptInvite/');
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        inviteLink = `${baseUrl}${inviteLink.startsWith('/') ? inviteLink : '/' + inviteLink}`;
      }
      
      if (!inviteLink) {
        throw new Error("Invitation created but no link returned by server");
      }

      return inviteLink;
    } catch (error) {
      console.error("Error generating invite link:", error);
      throw error;
    }
  };

  // Fetch team members
  const fetchTeamMembers = async (teamId: number): Promise<TeamMember[]> => {
    try {
      const teamIndex = teams.findIndex(t => t.id === teamId);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }
      
      const team = teams[teamIndex];
      
      const response = await fetch(getApiUrl(`teams/${teamId}/members/`), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      let data: TeamMember[] = await response.json();
      
      const ownerInMembers = data.some(m => m.user_id === team.owner.id);
      
      if (!ownerInMembers) {
        const ownerMember: TeamMember = {
          id: -1,
          user_id: team.owner.id,
          username: team.owner.username,
          email: team.owner.email,
          role: 'owner',
          joined_at: team.created_at
        };
        data.unshift(ownerMember);
      }
      
      setTeamMembers(data);
      return data;
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  };

  // Remove team member
  const removeTeamMember = async (teamId: number, userId: number) => {
    try {
      const response = await fetch(getApiUrl(`teams/${teamId}/remove-member/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to remove team member");
      }

      await fetchTeamMembers(teamId);
      return true;
    } catch (error) {
      console.error("Error removing team member:", error);
      throw error;
    }
  };

  // Assign project to team
  const assignProject = async (teamId: number, projectId: number) => {
    try {
      const endpoint = `teams/${teamId}/assign-project/`;
      const fullUrl = getApiUrl(endpoint);
      
      console.log("🔵 Assigning project:", { teamId, projectId });
      console.log("🔵 Endpoint:", endpoint);
      console.log("🔵 Full URL:", fullUrl);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ project_id: projectId }),
      });

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Assign project error:", errorData);
        throw new Error(errorData.detail || "Failed to assign project");
      }

      const responseData = await response.json();
      console.log("✅ Assignment successful, response:", responseData);

      // Immediately update the project in state with normalized data
      if (responseData.project) {
        const updatedProject: Project = {
          ...responseData.project,
          team_id: responseData.project.team_id !== undefined 
            ? responseData.project.team_id 
            : (responseData.project.team ? responseData.project.team.id : null),
          team: responseData.project.team || (responseData.project.team_id ? { 
            id: responseData.project.team_id, 
            name: responseData.project.team_name || '' 
          } : null)
        };
        
        setProjects((prevProjects) => 
          prevProjects.map((p) => p.id === updatedProject.id ? updatedProject : p)
        );
      }

      // Refresh both teams and projects to ensure consistency
      await Promise.all([fetchTeams(), fetchProjects()]);
      
      return true;
    } catch (error) {
      console.error("❌ Error assigning project:", error);
      throw error;
    }
  };

  // Unassign project from team
  const unassignProject = async (teamId: number, projectId: number) => {
    try {
      const response = await fetch(getApiUrl(`teams/${teamId}/unassign-project/`), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to unassign project");
      }

      await Promise.all([fetchTeams(), fetchProjects()]);
      return true;
    } catch (error) {
      console.error("Error unassigning project:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, [fetchTeams, fetchProjects]);

  return {
    teams,
    projects,
    teamMembers,
    isLoading: loading,
    error,
    fetchTeams,
    fetchProjects,
    fetchTeamMembers,
    createTeam,
    deleteTeam,
    generateInviteLink,
    removeTeamMember,
    assignProject,
    unassignProject,
    refreshTeams: fetchTeams,
  };
}