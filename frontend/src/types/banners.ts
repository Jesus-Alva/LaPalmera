export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url?: string | null;
}

export interface BannerCreate {
  title: string;
  subtitle: string;
  description: string;
}

export interface BannerUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
}