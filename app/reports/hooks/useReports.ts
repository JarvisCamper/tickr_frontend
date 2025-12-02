"use client";

import React from "react";
import { getApiUrl } from '@/constant/apiendpoints';
import { getAuthHeaders } from '@/context-and-provider/AuthContext';
import type { Activity } from '../types/report.types';

export function secondsToHMS(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const parseDurationToSeconds = (duration: any) => {
  if (!duration) return 0;
  if (typeof duration === 'string' && duration.includes(':')) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return Math.round((h || 0) * 3600 + (m || 0) * 60 + (s || 0));
    }
    if (parts.length === 2) {
      const [m, s] = parts;
      return Math.round((m || 0) * 60 + (s || 0));
    }
    return 0;
  }
  const secs = parseFloat(String(duration));
  if (Number.isFinite(secs)) return Math.round(secs);
  return 0;
};

type UseReportsOptions = {
  live?: boolean;
  pollIntervalMs?: number;
};

export function useReports(options?: UseReportsOptions) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeEntry, setActiveEntry] = React.useState<any | null>(null);
  const [activeSeconds, setActiveSeconds] = React.useState<number>(0);
  const [live, setLive] = React.useState<boolean>(!!options?.live);
  const [pollIntervalMs, setPollIntervalMs] = React.useState<number>(options?.pollIntervalMs ?? 10000);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entriesResp = await fetch(getApiUrl('entries/'), { headers: getAuthHeaders(), credentials: 'include' });
      if (!entriesResp.ok) {
        if (entriesResp.status === 401) setError('Not authenticated');
        else setError('Failed to load entries');
        setLoading(false);
        return;
      }
      const entries = await entriesResp.json();
      const mapped: Activity[] = entries.map((e: any) => ({
        id: String(e.id),
        project: e.project?.name || e.project_name || 'No project',
        seconds: parseDurationToSeconds(e.duration || e.duration_str || e.duration_seconds || e.duration_in_seconds),
        date: e.start_time || e.created_at || e.date || '',
      }));
      setActivities(mapped);

      try {
        const activeResp = await fetch(getApiUrl('entries/active/'), { headers: getAuthHeaders(), credentials: 'include' });
        if (activeResp.ok) {
          const active = await activeResp.json().catch(() => null);
          if (active && (active.is_running || active.started_at || active.start_time)) {
            setActiveEntry(active);
            const serverStart = active.started_at || active.start_time;
            const startMs = serverStart ? Date.parse(String(serverStart)) : NaN;
            if (!Number.isNaN(startMs)) setActiveSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
            else setActiveSeconds(0);
          } else {
            setActiveEntry(null);
            setActiveSeconds(0);
          }
        } else {
          setActiveEntry(null);
          setActiveSeconds(0);
        }
      } catch (err) {
        setActiveEntry(null);
        setActiveSeconds(0);
      }
    } catch (err: any) {
      console.error('Failed to fetch report data', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    fetchData();
    let timer: number | undefined;
    if (live) timer = window.setInterval(fetchData, pollIntervalMs);
    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, [live, pollIntervalMs, fetchData]);

  // Tick activeSeconds
  React.useEffect(() => {
    if (!activeEntry) return;
    const serverStart = activeEntry.started_at || activeEntry.start_time;
    const startMs = serverStart ? Date.parse(String(serverStart)) : NaN;
    if (Number.isNaN(startMs)) return;
    const tick = () => setActiveSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [activeEntry]);

  return {
    activities,
    loading,
    error,
    activeEntry,
    activeSeconds,
    fetchNow: fetchData,
    live,
    setLive,
    pollIntervalMs,
    setPollIntervalMs,
    secondsToHMS,
  };
}

export default useReports;
