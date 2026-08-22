export interface Space {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  image_url?: string | null;
  images_url?: string[];
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