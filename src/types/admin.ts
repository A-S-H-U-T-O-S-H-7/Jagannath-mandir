export interface Admin {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  permissions: string[];
  password?: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminSession {
  admin: Admin;
  sessionToken: string;
}

export interface AdminLoginResponse {
  success: boolean;
  error?: string;
  admin?: Admin;
  sessionToken?: string;
}

export interface AdminVerifyResponse {
  success: boolean;
  admin?: Admin;
}

export interface AdminPermissions {
  users: boolean;
  communities: boolean;
  events: boolean;
  notices: boolean;
  settings: boolean;
  adminManagement?: boolean;
}