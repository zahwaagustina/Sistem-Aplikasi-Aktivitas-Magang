import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, requireActiveMagang }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase();

  const normalizedAllowedRoles = allowedRoles?.map(role => role.toUpperCase());

  if (
    allowedRoles &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireActiveMagang && userRole === 'MAGANG' && user.status === 'SELESAI') {
    return <Navigate to="/magang/penyelesaian" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;