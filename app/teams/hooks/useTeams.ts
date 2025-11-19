// teams/hooks/useTeams.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "../../timer/hooks/useTimer";
import { useToast } from "../../../context-and-provider";
import { Team, TeamMember, Project } from "../index/type";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export function useTeams() {
  const router = useRouter();
  const { getAuthHeaders } = useTimer();
  const { showToast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      showToast("Failed to load teams", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      showToast("Failed to load team members", "error");
    }
  };

  const createTeam = async (name: string, description: string) => {
    if (!name.trim()) {
      showToast("Team name is required", "error");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setTeams([...teams, data]);
        showToast("Team created successfully!", "success");
        return true;
      } else {
        const errorData = await response.json();
        showToast(errorData.detail || "Failed to create team", "error");
        return false;
      }
    } catch (error) {
      console.error("Error creating team:", error);
      showToast("Error creating team", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (teamId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setTeams(teams.filter((team) => team.id !== teamId));
        showToast("Team deleted successfully!", "success");
        return true;
      } else {
        showToast("Failed to delete team", "error");
        return false;
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      showToast("Error deleting team", "error");
      return false;
    }
  };

  const generateInviteLink = async (teamId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invite/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        showToast("Invitation link created!", "success");
        return data.invitation_link;
      } else {
        const errorData = await response.json();
        showToast(errorData.detail || "Failed to create link", "error");
        return null;
      }
    } catch (error) {
      console.error("Error creating link:", error);
      showToast("Error creating invitation link", "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const assignProject = async (projectId: number, teamId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ team_id: teamId, type: "group" }),
      });

      if (response.ok) {
        showToast("Project assigned successfully!", "success");
        await fetchProjects();
        return true;
      } else {
        const errorData = await response.json();
        showToast(errorData.detail || "Failed to assign project", "error");
        return false;
      }
    } catch (error) {
      console.error("Error assigning project:", error);
      showToast("Error assigning project", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unassignProject = async (projectId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ team_id: null, type: "individual" }),
      });

      if (response.ok) {
        showToast("Project unassigned successfully!", "success");
        await fetchProjects();
        return true;
      } else {
        showToast("Failed to unassign project", "error");
        return false;
      }
    } catch (error) {
      console.error("Error unassigning project:", error);
      showToast("Error unassigning project", "error");
      return false;
    }
  };

  return {
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
  };
}