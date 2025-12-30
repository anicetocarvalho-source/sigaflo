import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requireAnyRole?: boolean; // If true, user needs ANY of the roles. If false, needs ALL
}

export const ProtectedRoute = ({ 
  children, 
  requiredRoles,
  requireAnyRole = true 
}: ProtectedRouteProps) => {
  const { user, roles, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRoles = requireAnyRole
      ? requiredRoles.some(role => roles.includes(role))
      : requiredRoles.every(role => roles.includes(role));

    if (!hasRequiredRoles) {
      return <Navigate to="/sem-permissao" replace />;
    }
  }

  return <>{children}</>;
};
