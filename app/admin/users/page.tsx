"use client";

import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "@/constant/apiendpoints";
import { getAuthHeaders, safeFetch } from "../utils/apiHelper";

interface User {
  id: number;
  username?: string;
  email: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at?: string;
}

interface UserForm {
  email: string;
  username: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

const initialForm: UserForm = {
  email: "",
  username: "",
  is_active: true,
  is_staff: false,
  is_superuser: false,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await safeFetch("/admin/api/users/");
    if (data) {
      setUsers(Array.isArray(data) ? data : data.results || []);
      setError("");
    } else {
      setUsers([]);
      setError("Failed to load users.");
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      (user.username || "").toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      username: user.username || "",
      is_active: !!user.is_active,
      is_staff: !!user.is_staff,
      is_superuser: !!user.is_superuser,
    });
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(getApiUrl(`/admin/api/users/${editingUser.id}/`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setError("Failed to update user.");
        return;
      }

      setEditingUser(null);
      setForm(initialForm);
      await fetchUsers();
    } catch {
      setError("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const callUserAction = async (userId: number, action: "suspend" | "activate") => {
    setError("");
    try {
      const response = await fetch(getApiUrl(`/admin/api/users/${userId}/${action}/`), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        setError(`Failed to ${action} user.`);
        return;
      }
      await fetchUsers();
    } catch {
      setError(`Failed to ${action} user.`);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm("Delete this user?")) return;
    setError("");
    try {
      const response = await fetch(getApiUrl(`/admin/api/users/${userId}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        setError("Failed to delete user.");
        return;
      }
      await fetchUsers();
    } catch {
      setError("Failed to delete user.");
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
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Edit user roles, activation status, and access.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl outline-none focus:border-cyan-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.username || user.email}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.is_superuser ? "Superadmin" : user.is_staff ? "Admin" : "Employee"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(user)} className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">
                        Edit
                      </button>
                      {user.is_active ? (
                        <button onClick={() => void callUserAction(user.id, "suspend")} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => void callUserAction(user.id, "activate")} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                          Activate
                        </button>
                      )}
                      <button onClick={() => void deleteUser(user.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">Edit User</h2>
            <p className="mt-1 text-sm text-slate-500">{editingUser.email}</p>
            <div className="mt-5 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 flex items-center justify-between">
                  Active
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((current) => ({ ...current, is_active: e.target.checked }))} />
                </label>
                <label className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 flex items-center justify-between">
                  Admin
                  <input type="checkbox" checked={form.is_staff} onChange={(e) => setForm((current) => ({ ...current, is_staff: e.target.checked }))} />
                </label>
                <label className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 flex items-center justify-between">
                  Superadmin
                  <input type="checkbox" checked={form.is_superuser} onChange={(e) => setForm((current) => ({ ...current, is_superuser: e.target.checked }))} />
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
                Cancel
              </button>
              <button onClick={() => void saveUser()} disabled={saving} className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save User"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
