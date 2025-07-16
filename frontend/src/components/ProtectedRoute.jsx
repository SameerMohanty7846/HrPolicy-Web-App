import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole, Component }) => {
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!token || !user) {
    alert('You must be logged in to access this page.');
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    alert('You are not authorized to access this page.');
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
