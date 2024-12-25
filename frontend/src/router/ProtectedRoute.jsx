import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};