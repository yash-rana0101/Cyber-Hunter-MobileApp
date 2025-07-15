import { API_URL } from '@/constants/url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  _id: string;
  email: string;
  name?: string;
  profilePicture?: string;
  accessToken?: string;
  refreshToken?: string;
  twoFactorEnabled?: boolean;
  // Add any other user properties you need
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  signIn: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUserToken: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = true;

  const signIn = async (userData: any) => {
    try {
      setLoading(true);
      
      // Store user data and tokens
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Set axios default headers
      if (userData.accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');
      setLoading(true);
      
      // Immediately set authentication to false to prevent navigation issues
      setIsAuthenticated(false);
      setUser(null);
      
      // Call backend logout endpoint to invalidate server-side session with timeout
      try {
        console.log('Attempting server logout...');
        const logoutPromise = axios.post(`${API_URL}/api/v1/auth/logout`);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Logout timeout')), 5000)
        );
        
        await Promise.race([logoutPromise, timeoutPromise]);
        console.log('Server logout successful');
      } catch (error) {
        // Continue with local cleanup even if server logout fails
        console.warn('Server logout failed, continuing with local cleanup:', error);
      }
      
      console.log('Clearing local storage...');
      
      // Clear ALL AsyncStorage data
      try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared');
      } catch (error) {
        console.error('Failed to clear AsyncStorage:', error);
      }
      
      // Clear specific storage keys that might exist
      const keysToRemove = [
        'user',
        'accessToken', 
        'refreshToken',
        'userToken',
        'authToken',
        'userCredentials',
        'sessionData',
        'onboardingCompleted',
        'userProfile',
        'appSettings'
      ];
      
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
        } catch {
          console.warn(`Failed to remove ${key}`);
        }
      }
      
      console.log('Clearing axios headers...');
      
      // Clear all axios headers and reset instance
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['x-access-token'];
      delete axios.defaults.headers.common['token'];
      axios.defaults.headers.common = {};
      
      // Clear any cookies if running on web
      if (typeof document !== 'undefined') {
        try {
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          });
        } catch {
          console.log('Cookie clearing not available');
        }
      }
      
      // Clear web storage if available
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          console.log('Web storage not available');
        }
      }
      
      console.log('Resetting auth state...');
      
      // Reset all state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User successfully logged out and all data cleared');
      console.log('Redirecting to login...');
      
      // Redirect to login immediately
      router.replace('/auth/login');
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, force clear everything and redirect
      try {
        await AsyncStorage.clear();
      } catch {
        console.error('Failed to clear AsyncStorage in error handler');
      }
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Force redirecting to login due to error...');
      router.replace('/auth/login');
    } finally {
      setLoading(false);
      console.log('SignOut process completed');
    }
  };

  const refreshUserToken = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/v1/auth/refresh`);
      const { accessToken, refreshToken } = response.data.data;

      // Update user in storage with new tokens
      const currentUser = await AsyncStorage.getItem('user');
      if (currentUser) {
        const updatedUser = { ...JSON.parse(currentUser), accessToken, refreshToken };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      // Update axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // Set axios default headers
          if (parsedUser.accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.accessToken}`;
          }
          
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        signIn,
        signOut,
        refreshUserToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};