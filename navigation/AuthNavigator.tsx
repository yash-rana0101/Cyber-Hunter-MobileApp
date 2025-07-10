import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import screens (we'll create these later)
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import UserDetailsScreen from '../screens/auth/UserDetailsScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string };
  UserDetails: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
