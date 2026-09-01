// Types placeholder
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  workspace_id: string;
  parent_id?: string | null;
  title: string;
  icon?: string;
  cover_image?: string;
  is_favorite: boolean;
  is_archived: boolean;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}
