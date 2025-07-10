import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import screens (we'll create these later)
import OnboardingScreen from '../screens/auth/OnboardingScreen';

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
