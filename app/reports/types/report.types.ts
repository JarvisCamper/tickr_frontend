export type Activity = {
  id: string;
  project: string;
  seconds: number;
  date: string; // ISO
};

export type ActiveEntry = {
  id: string | number;
  project?: { id?: number; name?: string } | string;
  started_at?: string;
  start_time?: string;
  is_running?: boolean;
  description?: string;
};
