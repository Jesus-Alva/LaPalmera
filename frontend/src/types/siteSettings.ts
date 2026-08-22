export type SettingKey =
  | 'branding'
  | 'seo'
  | 'contact_info'
  | 'schedule'
  | 'social_networks'
  | 'footer'
  | 'home_banner'
  | 'scripts'
  | 'reservation';

export interface Branding {
  site_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  typography: string;
}

export interface Seo {
  meta_title: string;
  meta_description: string;
  og_image: string;
  keywords: string;
}

export interface ContactInfoItem {
  title: string;
  value: string;
}

export interface ScheduleItem {
  days: string;
  time: string;
}

export interface SocialNetworks {
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
}

export interface Footer {
  copyright_text: string;
  developer_credit: string;
  extra_message: string;
}

export interface HomeBanner {
  title: string;
  slogan: string;
  button_text: string;
  background_image: string;
}

export interface Scripts {
  google_analytics_id: string;
  facebook_pixel_id: string;
  custom_head_code: string;
}

export interface Reservation {
  form_title: string;
  description: string;
  success_message: string;
}

export interface SettingValueMap {
  branding: Branding;
  seo: Seo;
  contact_info: ContactInfoItem[];
  schedule: ScheduleItem[];
  social_networks: SocialNetworks;
  footer: Footer;
  home_banner: HomeBanner;
  scripts: Scripts;
  reservation: Reservation;
}

export interface SiteSetting<K extends SettingKey = SettingKey> {
  setting_key: K;
  setting_value: SettingValueMap[K];
  updated_at: string | null;
}
