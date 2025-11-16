import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useUser();

  // Wait for user data to load before making any decisions
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // If not logged in, redirect to main page (avoid sending users to signup on logout)
  if (!user || !user.loggedIn) {
    return <Navigate to="/" replace />;
  }

  // If a specific role is required and user doesn't have it, redirect to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // All good
  return children;
}
