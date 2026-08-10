export interface Celebration {
  id: number;
  title: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface CelebrationCreate {
  title: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CelebrationUpdate {
  title?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}