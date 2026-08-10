import { ReactNode } from 'react';

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnDef<T> {
  key: keyof T | string; // puede ser una clave del objeto o un identificador
  label: string;
  align?: ColumnAlign;
  // Si no se usa render, se mostrará el valor de data[key]
  render?: (item: T) => ReactNode;
  // Para ordenar (opcional)
  sortable?: boolean;
}

export interface ActionDef<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: 'primary' | 'danger' | 'warning' | 'info';
  disabled?: (item: T) => boolean;
  visible?: (item: T) => boolean;
  loading?: (item: T) => boolean;
}