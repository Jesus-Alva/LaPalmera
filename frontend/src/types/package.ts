export interface Package {
  id: number;
  title: string;
  short_description: string | null;
  image_path: string | null;   
  is_active: boolean;
  sort_order: number | null;
  celebration_id: number;
  celebration_title?: string;      
  date_available_start: string | null;
  date_available_end: string | null;  
  
  image_url: string | null;          
  images_url: string[];              
  
  features: PackageFeature[];
  
  is_available?: boolean;            
}

export interface PackageCreate {
  title: string;
  short_description?: string;
  image_path?: string;
  is_active?: boolean;
  sort_order?: number;
  celebration_id: number;
  date_available_start?: string | null;
  date_available_end?: string | null;
  features?: PackageFeatureCreate[]
}

export interface PackageUpdate {
  title?: string;
  short_description?: string;
  image_path?: string;
  is_active?: boolean;
  sort_order?: number;
  celebration_id?: number;
  date_available_start?: string | null;
  date_available_end?: string | null;
  features?: PackageFeatureCreate[];
}

export interface PackageFeature {
  id: number;
  feature_key: string;
  feature_value: string;
}

export interface PackageFeatureCreate {
  feature_key: string;
  feature_value: string;
}
