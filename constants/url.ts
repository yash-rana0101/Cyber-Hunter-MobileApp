// For Expo/React Native, we need to use environment variables properly
// Environment variables should be prefixed with EXPO_PUBLIC_ and accessed directly
const API_URL_FROM_ENV = process.env.EXPO_PUBLIC_API_URL;
export const API_URL = API_URL_FROM_ENV || 'http://localhost:3000/api';

// Debug logging (remove in production)
console.log('Environment API_URL:', API_URL_FROM_ENV);
console.log('Final API_URL:', API_URL);