import { PackageFeatureCatalog, PackageFeatureCatalogCreate } from '@/src/types/packageFeatureCatalog';
import { getApiBaseUrl } from './client';

const API_URL = getApiBaseUrl();

export async function getPackageFeatureCatalog(): Promise<PackageFeatureCatalog[]> {
  const res = await fetch(`${API_URL}/package-feature-catalog`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al cargar el catálogo de características');
  return res.json();
}

export async function createPackageFeatureCatalogItem(data: PackageFeatureCatalogCreate): Promise<PackageFeatureCatalog> {
  const res = await fetch(`${API_URL}/package-feature-catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear la característica');
  }
  return res.json();
}
