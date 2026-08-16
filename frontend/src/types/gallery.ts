// src/types/gallery.ts
export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: number;
  category_id: number;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
}

export interface GalleryCategoryCreate {
  name: string;
  slug: string;
  sort_order?: number;
}

export interface GalleryCategoryUpdate {
  name?: string;
  slug?: string;
  sort_order?: number;
}

export interface GalleryImageCreate {
  category_id: number;
  image_path: string;
  alt_text?: string;
  sort_order?: number;
}

export interface GalleryImageUpdate {
  alt_text?: string;
  sort_order?: number;
}