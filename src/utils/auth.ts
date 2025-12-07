export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface AuthData {
  token: string;
  user: AuthUser;
}

export const getAuthData = (): AuthData | null => {
  try {
    const authData = localStorage.getItem('iru-auth');
    if (!authData) return null;
    return JSON.parse(authData);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthData() !== null;
};

export const getUser = (): AuthUser | null => {
  const authData = getAuthData();
  return authData?.user || null;
};

export const getToken = (): string | null => {
  const authData = getAuthData();
  return authData?.token || null;
};

export const logout = (): void => {
  localStorage.removeItem('iru-auth');
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};

