export interface TimeEntry {
  id: number;
  description: string;
  project?: { id: number; name: string } | number | null;
  project_id?: number | null;
  start_time: string;
  project_name?: string | null;
  end_time: string | null;
  duration: string;
  duration_str?: string;
  is_running: boolean;
}

export interface Project {
  id: number;
  name: string;
}
