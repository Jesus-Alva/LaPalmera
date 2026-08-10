export interface ImageType {
  id: number;
  image_path: string;
  alt_text: string;
}

export interface Image {
  id: number;
  catalog_id: number;
  image_path: string;
  alt_text: string | null;
}

export interface ImagesCatalog {
  id: number;
  package_id: number | null;
  space_id: number | null;
  banner_id: number | null;
  images: Image[];
}