// src/types/gallery.ts
export interface GalleryImage {
  id: number;
  category_id: number;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
}

export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  images: GalleryImage[];
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