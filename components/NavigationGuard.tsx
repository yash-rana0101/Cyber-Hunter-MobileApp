import { useRouter, useSegments } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

interface NavigationGuardProps {
  children: React.ReactNode;
}

export const NavigationGuard: React.FC<NavigationGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated) {
      // User is not authenticated
      if (inTabsGroup) {
        // Redirect to login if trying to access protected routes
        console.log('Redirecting to login - user not authenticated');
        router.replace('/auth/login');
      }
    } else {
      // User is authenticated
      if (inAuthGroup) {
        // Redirect to dashboard if trying to access auth routes while authenticated
        console.log('Redirecting to dashboard - user already authenticated');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, segments, loading, router]);

  return <>{children}</>;
};
