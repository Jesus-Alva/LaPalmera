export type UserRole = 'admin' | 'editor' | 'read';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  status: UserStatus;
  notifications_enabled: boolean;
  last_login_at: string | null;
}

export interface UserAdminUpdate {
  role?: UserRole;
  status?: UserStatus;
}
