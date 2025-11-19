export interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  creator: {
    id: number;
    username: string;
    email: string;
  };
  team_id: number | null;
  created_at: string;
}

export interface NewProjectForm {
  name: string;
  description: string;
  type: string;
  team_id: string;
}