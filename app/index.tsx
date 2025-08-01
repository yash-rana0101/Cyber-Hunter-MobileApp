import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthContext } from '../context/AuthContext';

export default function RootIndex() {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete
    
    if (isAuthenticated) {
      // Check if user profile is complete
      if (user && !user.isProfileComplete) {
        console.log('User profile incomplete, redirecting to user details');
        router.replace('/auth/user-details');
      } else {
        console.log('Redirecting to dashboard');
        router.replace('/(tabs)');
      }
    } else {
      console.log('Redirecting to login');
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading, router, user]);

  // Show loading screen while determining authentication status
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: Colors.background 
    }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
