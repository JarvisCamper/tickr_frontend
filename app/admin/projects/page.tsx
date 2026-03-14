"use client";

import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "@/constant/apiendpoints";
import { getAuthHeaders, safeFetch } from "../utils/apiHelper";

interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  creator?: number;
  creator_email?: string;
  creator_username?: string;
  team?: number | null;
  team_name?: string | null;
  created_at: string;
  time_entries_count?: number;
}

interface UserOption {
  id: number;
  username?: string;
  email: string;
}

interface TeamOption {
  id: number;
  name: string;
}

interface ProjectForm {
  name: string;
  description: string;
  type: string;
  creator_id: string;
  team_id: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    type: "individual",
    creator_id: "",
    team_id: "",
  });

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void fetchPageData();
  }, []);

  const fetchPageData = async () => {
    setLoading(true);
    const [projectData, userData, teamData] = await Promise.all([
      safeFetch("/admin/api/projects/"),
      safeFetch("/admin/api/users/?page_size=100"),
      safeFetch("/admin/api/teams/?page_size=100"),
    ]);

    if (projectData) {
      setProjects(Array.isArray(projectData) ? projectData : projectData.results || []);
      setError("");
    } else {
      setProjects([]);
      setError("Failed to load projects.");
    }

    if (userData) {
      setUsers(Array.isArray(userData) ? userData : userData.results || []);
    } else {
      setUsers([]);
    }

    if (teamData) {
      setTeams(Array.isArray(teamData) ? teamData : teamData.results || []);
    } else {
      setTeams([]);
    }

    setLoading(false);
  };

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      project.name.toLowerCase().includes(search) ||
      (project.description || "").toLowerCase().includes(search) ||
      (project.creator_username || "").toLowerCase().includes(search) ||
      (project.creator_email || "").toLowerCase().includes(search) ||
      (project.team_name || "").toLowerCase().includes(search);
    const matchesType = filterType === "" || project.type === filterType;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setEditingProject(null);
    setShowModal(false);
    setForm({
      name: "",
      description: "",
      type: "individual",
      creator_id: "",
      team_id: "",
    });
  };

  const openCreate = () => {
    setEditingProject(null);
    setForm({
      name: "",
      description: "",
      type: "individual",
      creator_id: users[0] ? String(users[0].id) : "",
      team_id: "",
    });
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || "",
      type: project.type,
      creator_id: project.creator ? String(project.creator) : "",
      team_id: project.team ? String(project.team) : "",
    });
    setShowModal(true);
  };

  const saveProject = async () => {
    setSaving(true);
    setError("");

    try {
      const endpoint = editingProject
        ? `/admin/api/projects/${editingProject.id}/`
        : "/admin/api/projects/";
      const response = await fetch(getApiUrl(endpoint), {
        method: editingProject ? "PATCH" : "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          type: form.type,
          creator_id: Number(form.creator_id),
          team_id: form.team_id ? Number(form.team_id) : null,
        }),
      });

      if (!response.ok) {
        setError(editingProject ? "Failed to update project." : "Failed to create project.");
        return;
      }

      resetForm();
      await fetchPageData();
    } catch {
      setError(editingProject ? "Failed to update project." : "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!window.confirm("Delete this project?")) return;
    setError("");
    try {
      const response = await fetch(getApiUrl(`/admin/api/projects/${projectId}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        setError("Failed to delete project.");
        return;
      }
      await fetchPageData();
    } catch {
      setError("Failed to delete project.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Create, update, and remove projects across the workspace.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          Create Project
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            type="text"
            placeholder="Search projects by name, creator, or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-2xl outline-none focus:border-cyan-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-2xl outline-none focus:border-cyan-500"
          >
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Team</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Entries</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{project.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{project.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.type === 'individual'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {project.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="text-sm font-medium text-gray-900">
                      {project.creator_username || "Unknown creator"}
                    </div>
                    <div className="text-sm text-gray-500">{project.creator_email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{project.team_name || "No team"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{project.time_entries_count ?? 0}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(project)}
                        className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void deleteProject(project.id)}
                        className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredProjects.length} of {projects.length} projects
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">
              {editingProject ? "Edit Project" : "Create Project"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingProject
                ? "Adjust project metadata, owner, and team assignment."
                : "Create a new project directly from the admin portal."}
            </p>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Project name"
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  value={form.type}
                  onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
                <select
                  value={form.creator_id}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, creator_id: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="">Select creator</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username || user.email}
                    </option>
                  ))}
                </select>
                <select
                  value={form.team_id}
                  onChange={(e) => setForm((current) => ({ ...current, team_id: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => void saveProject()}
                disabled={saving || !form.name.trim() || !form.creator_id}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : editingProject ? "Save Project" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
