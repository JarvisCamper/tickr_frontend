// teams/types.ts

export interface Team {
  id: number;
  name: string;
  description: string;
  owner: {
    id: number;
    username: string;
    email: string;
  };
  member_count: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  joined_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  team_id: number | null;
  created_at: string;
}