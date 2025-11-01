export interface Role {
  id: number;
  name: string;
  is_system: boolean;
  description: string;
}

export interface Permission {
  id: number;
  name: string;
  action: string;
  resource: string;
  description: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: Role[];
  permissions: Permission[];
  last_login: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}
