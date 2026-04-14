"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getApiUrl } from "@/constant/apiendpoints";
import { getAuthHeaders, safeFetch } from "../utils/apiHelper";
import { PaginationControls } from "@/app/components/PaginationControls";

interface UserOption {
  id: number;
  username?: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  owner?: number;
  owner_email?: string;
  owner_username?: string;
  members_count?: number;
  projects_count?: number;
  created_at?: string;
}

interface TeamForm {
  name: string;
  description: string;
  owner_id: string;
}

const initialForm: TeamForm = {
  name: "",
  description: "",
  owner_id: "",
};

const TEAMS_PER_PAGE = 9;

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TeamForm>(initialForm);
  const [currentPage, setCurrentPage] = useState(1);

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void fetchPageData();
  }, []);

  const fetchPageData = async () => {
    setLoading(true);
    const [teamData, userData] = await Promise.all([
      safeFetch("/admin/api/teams/"),
      safeFetch("/admin/api/users/?page_size=100"),
    ]);

    if (teamData) {
      setTeams(Array.isArray(teamData) ? teamData : teamData.results || []);
      setError("");
    } else {
      setTeams([]);
      setError("Failed to load teams.");
    }

    if (userData) {
      setUsers(Array.isArray(userData) ? userData : userData.results || []);
    } else {
      setUsers([]);
    }

    setLoading(false);
  };

  const filteredTeams = useMemo(
    () =>
      teams.filter((team) => {
        const search = searchTerm.toLowerCase();
        return (
          team.name.toLowerCase().includes(search) ||
          (team.description || "").toLowerCase().includes(search) ||
          (team.owner_username || "").toLowerCase().includes(search) ||
          (team.owner_email || "").toLowerCase().includes(search)
        );
      }),
    [teams, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / TEAMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTeams = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * TEAMS_PER_PAGE;
    return filteredTeams.slice(startIndex, startIndex + TEAMS_PER_PAGE);
  }, [filteredTeams, safeCurrentPage]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingTeam(null);
    setShowModal(false);
  };

  const openCreate = () => {
    setEditingTeam(null);
    setForm({
      ...initialForm,
      owner_id: users[0] ? String(users[0].id) : "",
    });
    setShowModal(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      description: team.description || "",
      owner_id: team.owner ? String(team.owner) : "",
    });
    setShowModal(true);
  };

  const saveTeam = async () => {
    setSaving(true);
    setError("");

    try {
      const endpoint = editingTeam
        ? `/admin/api/teams/${editingTeam.id}/`
        : "/admin/api/teams/";
      const response = await fetch(getApiUrl(endpoint), {
        method: editingTeam ? "PATCH" : "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          owner_id: Number(form.owner_id),
        }),
      });

      if (!response.ok) {
        setError(editingTeam ? "Failed to update team." : "Failed to create team.");
        return;
      }

      resetForm();
      await fetchPageData();
    } catch {
      setError(editingTeam ? "Failed to update team." : "Failed to create team.");
    } finally {
      setSaving(false);
    }
  };

  const deleteTeam = async (teamId: number) => {
    if (!window.confirm("Delete this team?")) return;
    setError("");
    try {
      const response = await fetch(getApiUrl(`/admin/api/teams/${teamId}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        setError("Failed to delete team.");
        return;
      }
      await fetchPageData();
    } catch {
      setError("Failed to delete team.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-hero rounded-[1.85rem] px-6 py-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Admin catalog</p>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-gray-600">
            Create teams, reassign owners, and clean up unused team spaces.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Create Team
        </button>
      </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="admin-table p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search teams by name, owner, or description..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="admin-input"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Team</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Members</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTeams.map((team) => (
                <tr key={team.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{team.name}</div>
                    <div className="mt-1 max-w-md text-sm text-gray-500">
                      {team.description || "No description provided."}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {team.owner_username || "Unknown owner"}
                    </div>
                    <div className="text-sm text-gray-500">{team.owner_email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{team.members_count ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{team.projects_count ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {team.created_at ? new Date(team.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(team)}
                        className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void deleteTeam(team.id)}
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

        {filteredTeams.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No teams found.</div>
        ) : null}

        <PaginationControls
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredTeams.length}
          pageSize={TEAMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="teams"
        />
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredTeams.length} of {teams.length} teams
      </div>

      {showModal ? (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="admin-panel w-full max-w-2xl rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">
              {editingTeam ? "Edit Team" : "Create Team"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingTeam
                ? "Update the team profile and owner assignment."
                : "Create a new team directly from the admin portal."}
            </p>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Team name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="admin-input"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                className="admin-textarea"
              />
              <select
                value={form.owner_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, owner_id: event.target.value }))
                }
                className="admin-select"
              >
                <option value="">Select owner</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => void saveTeam()}
                disabled={saving || !form.name.trim() || !form.owner_id}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : editingTeam ? "Save Team" : "Create Team"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
