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
