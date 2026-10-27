export type BusinessRole = 'owner' | 'staff';
export type PlatformRole = 'super_admin' | 'support';

export interface JwtPayload {
  sub: string;
  email: string;
  businessId: string | null;
  role: BusinessRole | null;
  platformRole: PlatformRole | null;
  tokenType: 'access' | 'refresh';
  impersonatorId?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  businessId: string | null;
  role: BusinessRole | null;
  platformRole: PlatformRole | null;
  permissions: string[];
  impersonatorId?: string;
}

export interface TenantContext {
  businessId: string;
  role: BusinessRole;
  permissions: string[];
  impersonatorId?: string;
}
