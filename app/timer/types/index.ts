export interface TimeEntry {
  id: number;
  description: string;
  project?: { id: number; name: string } | null;
  start_time: string;
  end_time: string | null;
  duration: string;
  is_running: boolean;
}

export interface Project {
  id: number;
  name: string;
}