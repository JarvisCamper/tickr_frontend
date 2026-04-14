"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from "react";
import { Camera, ImageIcon, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { getAuthHeaders, safeFetch } from "../utils/apiHelper";
import { getApiUrl } from "@/constant/apiendpoints";

interface ScreenshotItem {
  id: number;
  user?: number;
  username?: string;
  user_email?: string;
  project_name?: string | null;
  time_entry_description?: string;
  image_url?: string | null;
  captured_at: string;
  capture_source?: string;
}

interface AdminUser {
  id: number;
  username?: string;
  email: string;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
};

const isSameLocalDay = (value?: string | null, referenceDate = new Date()) => {
  if (!value) return false;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;

  return (
    parsed.getFullYear() === referenceDate.getFullYear() &&
    parsed.getMonth() === referenceDate.getMonth() &&
    parsed.getDate() === referenceDate.getDate()
  );
};

const resolveScreenshotUrl = (value?: string | null) => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    return new URL(trimmed, getApiUrl("/")).toString();
  } catch {
    return trimmed;
  }
};

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) => (
  <div className="admin-panel rounded-3xl p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </div>
);

export default function AdminScreenshotsPage() {
  const [galleryScreenshots, setGalleryScreenshots] = useState<ScreenshotItem[]>([]);
  const [allScreenshots, setAllScreenshots] = useState<ScreenshotItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [capturedOn, setCapturedOn] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadUsers = async () => {
    const data = await safeFetch("/admin/api/users/?page_size=100", { timeoutMs: 12000 });
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  };

  const loadScreenshotDirectory = async () => {
    const data = await safeFetch("/admin/api/screenshots/?page_size=100", { timeoutMs: 12000 });
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  };

  const loadGalleryScreenshots = async (selectedUser?: number | null, query = searchTerm) => {
    const params = new URLSearchParams({ page_size: "100" });
    if (query.trim()) params.set("search", query.trim());
    if (capturedOn) params.set("captured_on", capturedOn);
    if (selectedUser) params.set("user_id", String(selectedUser));

    const endpoint = `/admin/api/screenshots/?${params.toString()}`;
    const data = await safeFetch(endpoint, { timeoutMs: 12000 });
    if (!data) return null;
    return Array.isArray(data) ? data : data.results || [];
  };

  const refreshDirectory = async () => {
    const [userData, screenshotDirectory] = await Promise.all([
      loadUsers(),
      loadScreenshotDirectory(),
    ]);
    setUsers(userData);
    setAllScreenshots(screenshotDirectory);
  };

  const refreshGallery = async (nextSelectedUser = selectedUserId, query = searchTerm) => {
    setLoading(true);
    setError("");

    const screenshotData = await loadGalleryScreenshots(nextSelectedUser, query);

    if (screenshotData) {
      setGalleryScreenshots(screenshotData);
    } else {
      setGalleryScreenshots([]);
      setError("Failed to load screenshots.");
    }

    setLoading(false);
  };

  const refreshAll = async (nextSelectedUser = selectedUserId, query = searchTerm) => {
    setLoading(true);
    setError("");

    const [userData, screenshotDirectory, screenshotData] = await Promise.all([
      loadUsers(),
      loadScreenshotDirectory(),
      loadGalleryScreenshots(nextSelectedUser, query),
    ]);

    setUsers(userData);
    setAllScreenshots(screenshotDirectory);

    if (screenshotData) {
      setGalleryScreenshots(screenshotData);
    } else {
      setGalleryScreenshots([]);
      setError("Failed to load screenshots.");
    }

    setLoading(false);
  };

  useEffect(() => {
    void refreshAll();
  }, []);

  useEffect(() => {
    void refreshGallery(selectedUserId);
  }, [selectedUserId, capturedOn]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();
    const counts = new Map<number, number>();

    allScreenshots.forEach((item) => {
      if (item.user) {
        counts.set(item.user, (counts.get(item.user) || 0) + 1);
      }
    });

    return users
      .filter((user) => {
        if (!search) return true;
        return (
          (user.username || "").toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        );
      })
      .map((user) => ({
        ...user,
        screenshotCount: counts.get(user.id) || 0,
      }))
      .sort((a, b) => {
        if (selectedUserId === a.id) return -1;
        if (selectedUserId === b.id) return 1;
        return b.screenshotCount - a.screenshotCount;
      });
  }, [allScreenshots, users, userSearch, selectedUserId]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const stats = useMemo(() => {
    const uniqueUsers = new Set(
      allScreenshots.map((item) => item.user_email || item.username || `user-${item.id}`)
    ).size;
    const todayCount = allScreenshots.filter((item) => isSameLocalDay(item.captured_at)).length;

    return {
      total: allScreenshots.length,
      uniqueUsers,
      todayCount,
    };
  }, [allScreenshots]);

  async function handleDeleteScreenshot(id: number) {
    const confirmed = window.confirm("Delete this screenshot? This cannot be undone.");
    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(getApiUrl(`/admin/api/screenshots/${id}/`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Failed to delete screenshot.");
      }

      setGalleryScreenshots((prev) => prev.filter((item) => item.id !== id));
      setAllScreenshots((prev) => prev.filter((item) => item.id !== id));
      void refreshDirectory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete screenshot.");
    } finally {
      setDeletingId(null);
    }
  }

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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Work Session Review</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Screenshots</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review captured screenshots linked to tracked sessions, then click a user to focus on just their activity.
            </p>
          </div>
          <button
            onClick={() => void refreshAll()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Captures" value={stats.total} helper="All screenshots currently stored in the workspace." />
        <StatCard
          label={selectedUser ? "Selected User" : "Users Seen"}
          value={selectedUser ? (selectedUser.username || selectedUser.email) : stats.uniqueUsers}
          helper={selectedUser ? "Gallery is filtered to the selected user." : "Distinct users who have at least one screenshot."}
        />
        <StatCard label="Captured Today" value={stats.todayCount} helper="Screenshot records captured today across all users." />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="admin-panel rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Users</p>
              <p className="text-xs text-slate-500">Click a user to see only their screenshots.</p>
            </div>
          </div>

          <label className="relative mt-5 block">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="admin-input h-14 rounded-2xl pl-13 pr-4 text-sm"
            />
          </label>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => setSelectedUserId(null)}
              className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                selectedUserId === null
                  ? "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">All users</p>
                  <p className="mt-1 text-xs text-slate-500">Browse every screenshot in the system</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  {stats.total}
                </span>
              </div>
            </button>

            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    selectedUserId === user.id
                      ? "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.username || user.email}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {user.screenshotCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="admin-panel overflow-hidden rounded-3xl">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_12rem_10rem] md:items-center">
              <label className="relative min-w-0">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by user, project, or task description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input h-11 w-full rounded-xl pl-11 pr-4 text-sm"
                />
              </label>

              <div className="min-w-0">
                <input
                  type="date"
                  value={capturedOn}
                  onChange={(e) => setCapturedOn(e.target.value)}
                  className="admin-input h-11 w-full rounded-xl px-4 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => void refreshGallery(selectedUserId)}
                className="h-11 w-full rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Apply Filters
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {galleryScreenshots.length} shown
              </span>
              <span>
                {selectedUser ? `Filtered to ${selectedUser.username || selectedUser.email}` : "Showing screenshots across all users"}
              </span>
            </div>
          </div>

          {galleryScreenshots.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Camera className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-medium text-slate-700">No screenshots found</p>
              <p className="mt-2 text-sm text-slate-500">
                Once employees run tracked sessions with screen sharing enabled, captures will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2 2xl:grid-cols-3">
              {galleryScreenshots.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  {(() => {
                    const screenshotUrl = resolveScreenshotUrl(item.image_url);

                    return (
                      <>
                  <div className="aspect-16/10 bg-slate-100">
                    {screenshotUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={screenshotUrl} alt={`Screenshot ${item.id}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(item.user || null)}
                        className="min-w-0 text-left"
                      >
                        <p className="truncate font-semibold text-slate-900 hover:text-cyan-700">
                          {item.username || item.user_email || "Unknown user"}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">{item.user_email || "No email"}</p>
                      </button>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {item.capture_source || "screen-share"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-700">Project:</span> {item.project_name || "No project"}</p>
                      <p><span className="font-medium text-slate-700">Captured:</span> {formatDateTime(item.captured_at)}</p>
                      <p className="line-clamp-2">
                        <span className="font-medium text-slate-700">Task:</span> {item.time_entry_description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      {screenshotUrl ? (
                        <a
                          href={screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                        >
                          Open full image
                        </a>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDeleteScreenshot(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
