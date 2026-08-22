import { SettingKey, SettingValueMap, SiteSetting } from '@/src/types/siteSettings';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getSiteSettings(token?: string): Promise<SiteSetting[]> {
  const res = await fetch(`${API_URL}/site-settings/`, {
    ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cargar la configuración: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function updateSiteSetting<K extends SettingKey>(
  key: K,
  value: SettingValueMap[K]
): Promise<SiteSetting<K>> {
  const res = await fetch(`${API_URL}/site-settings/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ setting_value: value }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al guardar la configuración');
  }
  return res.json();
}
