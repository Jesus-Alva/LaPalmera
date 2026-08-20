export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url?: string | null;
  images_url?: string[];
}

export interface BannerCreate {
  title: string;
  subtitle?: string;
  description?: string;
}

export interface BannerUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
}