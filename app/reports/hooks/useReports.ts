"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiUrl } from '@/constant/apiendpoints';
import { getAuthHeaders } from '@/context-and-provider/AuthContext';
import type { Activity } from '../types/report.types';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TIME = 30000; // 30 seconds

export function secondsToHMS(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function parseDuration(duration: any): number {
  if (!duration) return 0;
  if (typeof duration === 'string' && duration.includes(':')) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const num = parseFloat(String(duration));
  return isFinite(num) ? Math.round(num) : 0;
}

export function useReports() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<any | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);

  const fetchData = useCallback(async () => {
    const cacheKey = 'reports_data';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
      setActivities(cached.data.activities);
      setActiveEntry(cached.data.activeEntry);
      if (cached.data.activeEntry) {
        const startTime = cached.data.activeEntry.started_at || cached.data.activeEntry.start_time;
        if (startTime) {
          const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
          setActiveSeconds(Math.max(0, elapsed));
        }
      }
      setLoading(false);
      return;
    }

    try {
      const [entriesRes, activeRes] = await Promise.all([
        fetch(getApiUrl('/api/entries/'), { headers: getAuthHeaders(), credentials: 'include' }),
        fetch(getApiUrl('/api/entries/active/'), { headers: getAuthHeaders(), credentials: 'include' })
      ]);

      if (entriesRes.ok) {
        const entries = await entriesRes.json();
        const mapped: Activity[] = entries.map((e: any) => ({
          id: String(e.id),
          project: e.project?.name || e.project_name || e.project || 'No project',
          seconds: parseDuration(e.duration || e.duration_seconds),
          date: e.start_time || e.created_at || '',
        }));
        setActivities(mapped);

        let activeData = null;
        if (activeRes.ok) {
          const active = await activeRes.json();
          if (active?.is_running) {
            setActiveEntry(active);
            activeData = active;
            const startTime = active.started_at || active.start_time;
            if (startTime) {
              const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
              setActiveSeconds(Math.max(0, elapsed));
            }
          } else {
            setActiveEntry(null);
            setActiveSeconds(0);
          }
        }

        cache.set(cacheKey, { data: { activities: mapped, activeEntry: activeData }, timestamp: Date.now() });
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!activeEntry) return;
    const startTime = activeEntry.started_at || activeEntry.start_time;
    if (!startTime) return;
    
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      setActiveSeconds(Math.max(0, elapsed));
    };
    
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  return { activities, loading, error, activeEntry, activeSeconds, secondsToHMS };
}

export default useReports;
