import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, token } = useAuthStore();
  
  // Double check authentication
  const isReallyAuthenticated = isAuthenticated && user && token;

  if (location.pathname === '/login') {
    return children;
  }

  if (!isReallyAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
