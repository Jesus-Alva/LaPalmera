export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  page: string | null;
  image_url?: string | null;
  images_url?: string[];
}

export interface BannerCreate {
  title: string;
  subtitle?: string;
  description?: string;
  page?: string | null;
}

export interface BannerUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
  page?: string | null;
}