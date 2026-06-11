import { jwtDecode } from 'jwt-decode';

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<Record<string, any>>(token);
    return (
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decoded.sub ||
      null
    );
  } catch {
    return null;
  }
}

export function IsAdmin(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    // Check short string property keys or fallback schema addresses
    const roles =
      payload['role'] ||
      payload['roles'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (Array.isArray(roles)) {
      return roles.map((r) => String(r).toLowerCase()).includes('admin');
    }
    return roles ? String(roles).toLowerCase() === 'admin' : false;
  } catch (error) {
    return false;
  }
}
