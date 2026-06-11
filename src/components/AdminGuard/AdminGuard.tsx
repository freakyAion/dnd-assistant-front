import { Navigate, Outlet } from 'react-router-dom';
import { IsAdmin } from '@/store/auth';

export function AdminGuard() {
  const isAdmin = IsAdmin();

  return isAdmin ? <Outlet /> : <Navigate to="/worlds" replace />;
}
