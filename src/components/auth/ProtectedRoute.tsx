import { Navigate, useLocation } from 'react-router-dom';
import { getStoredAuth } from '@/lib/auth';
import { LoadingPage } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated } = getStoredAuth();

  if (!isAuthenticated) {
    return <Navigate to="/business/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function AuthLoadingWrapper({ 
  isLoading, 
  isAuthenticated, 
  children 
}: { 
  isLoading: boolean; 
  isAuthenticated: boolean; 
  children: React.ReactNode;
}) {
  const location = useLocation();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/business/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
