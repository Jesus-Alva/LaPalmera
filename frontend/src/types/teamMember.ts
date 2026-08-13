export interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo_path: string | null;
  photo_alt: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface TeamMemberCreate {
  name: string;
  role: string;
  photo_path?: string;
  photo_alt?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface TeamMemberUpdate {
  name?: string;
  role?: string;
  photo_path?: string;
  photo_alt?: string;
  sort_order?: number;
  is_active?: boolean;
}