export interface Space {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
}

export interface SpaceCreate {
  title: string;
  description?: string;
  is_active?: boolean;
}

export interface SpaceUpdate {
  title?: string;
  description?: string;
  is_active?: boolean;
}