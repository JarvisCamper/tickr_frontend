// teams/index/type.ts

export interface Team {
  id: number;
  name: string;
  description: string;
  owner: {
    id: number;
    username: string;
    email: string;
  };
  owner_username: string;
  members: TeamMember[];
  member_count: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  user_id: number;
  email: string;
  username: string;
  role: 'member' | 'owner';
  joined_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  team_id: number | null;
  team?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}