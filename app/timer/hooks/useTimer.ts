"use client";
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

export function useTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTime(0); // Reset timer when starting
  };

  const stopTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    setTime(0); // Reset timer when stopping
  };

  const getAuthHeaders = (): HeadersInit => {
    // FIXED: Get token from Cookies instead of localStorage
    const token = Cookies.get('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Timer effect - runs when isRunning changes
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when isRunning changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    time,
    isRunning,
    formatTime,
    startTimer,
    stopTimer,
    getAuthHeaders,
  };
}