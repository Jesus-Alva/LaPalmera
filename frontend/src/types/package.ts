export interface Package {
  id: number;
  title: string;
  short_description: string | null;
  image_path: string | null;
  is_active: boolean;
  sort_order: number | null;
  celebration_id: number;
  celebration_title?: string;
  data_available_start: string | null;  // fecha ISO
  data_available_end: string | null;
  image_url?: string | null;
  is_available?: boolean;
}

export interface PackageCreate {
  title: string;
  short_description?: string;
  image_path?: string;
  is_active?: boolean;
  sort_order?: number;
  celebration_id: number;
  data_available_start?: string | null;
  data_available_end?: string | null;
}

export interface PackageUpdate {
  title?: string;
  short_description?: string;
  image_path?: string;
  is_active?: boolean;
  sort_order?: number;
  celebration_id?: number;
  data_available_start?: string | null;
  data_available_end?: string | null;
}