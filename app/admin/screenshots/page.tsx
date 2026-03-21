"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, ImageIcon, RefreshCw, Search, Trash2 } from "lucide-react";
import { getAuthHeaders, safeFetch } from "../utils/apiHelper";
import { getApiUrl } from "@/constant/apiendpoints";

interface ScreenshotItem {
  id: number;
  username?: string;
  user_email?: string;
  project_name?: string | null;
  time_entry_description?: string;
  image_url?: string | null;
  captured_at: string;
  capture_source?: string;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
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
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [capturedOn, setCapturedOn] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadScreenshots(searchValue: string, dateValue: string) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (dateValue) params.set("captured_on", dateValue);

    const query = params.toString();
    const endpoint = query ? `/admin/api/screenshots/?${query}` : "/admin/api/screenshots/";
    const data = await safeFetch(endpoint, { timeoutMs: 12000 });

    if (data) {
      setScreenshots(Array.isArray(data) ? data : data.results || []);
    } else {
      setScreenshots([]);
      setError("Failed to load screenshots.");
    }

    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    const loadInitialScreenshots = async () => {
      setLoading(true);
      setError("");

      const data = await safeFetch("/admin/api/screenshots/", { timeoutMs: 12000 });

      if (cancelled) return;

      if (data) {
        setScreenshots(Array.isArray(data) ? data : data.results || []);
      } else {
        setScreenshots([]);
        setError("Failed to load screenshots.");
      }

      setLoading(false);
    };

    void loadInitialScreenshots();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredScreenshots = useMemo(() => {
    return screenshots.filter((item) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        (item.username || "").toLowerCase().includes(search) ||
        (item.user_email || "").toLowerCase().includes(search) ||
        (item.project_name || "").toLowerCase().includes(search) ||
        (item.time_entry_description || "").toLowerCase().includes(search);

      const matchesDate =
        !capturedOn || (item.captured_at || "").slice(0, 10) === capturedOn;

      return matchesSearch && matchesDate;
    });
  }, [capturedOn, screenshots, searchTerm]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(
      screenshots.map((item) => item.user_email || item.username || `user-${item.id}`)
    ).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = screenshots.filter((item) => (item.captured_at || "").slice(0, 10) === today).length;

    return {
      total: screenshots.length,
      uniqueUsers,
      todayCount,
    };
  }, [screenshots]);

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

      setScreenshots((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete screenshot.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
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
              Review captured screenshots linked to active work sessions, users, and projects.
            </p>
          </div>
          <button
            onClick={() => void loadScreenshots(searchTerm, capturedOn)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Captures" value={stats.total} helper="All screenshot records in the current result set." />
        <StatCard label="Employees Seen" value={stats.uniqueUsers} helper="Distinct users represented in the loaded screenshots." />
        <StatCard label="Captured Today" value={stats.todayCount} helper="Screenshots recorded today across the workspace." />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="admin-panel rounded-3xl overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <label className="relative block">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user, project, or task description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input py-3 pl-11 pr-4 text-sm"
              />
            </label>
            <input
              type="date"
              value={capturedOn}
              onChange={(e) => setCapturedOn(e.target.value)}
              className="admin-input px-4 py-3 text-sm"
            />
            <div className="hidden lg:flex items-center justify-end text-sm text-slate-500">
              Showing {filteredScreenshots.length} of {screenshots.length} screenshots
            </div>
          </div>
        </div>

        {filteredScreenshots.length === 0 ? (
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
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredScreenshots.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[16/10] bg-slate-100">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={`Screenshot ${item.id}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.username || item.user_email || "Unknown user"}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.user_email || "No email"}</p>
                    </div>
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
                    {item.image_url ? (
                      <a
                        href={item.image_url}
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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
