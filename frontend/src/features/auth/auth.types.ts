export type UserRole = "citizen" | "cmo" | "department_officer" | "public";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  department?: string | null;
  role: UserRole;
};

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type AuthResponse = ApiResponse<{ user: AuthUser }>;

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  role: UserRole | null;
};
