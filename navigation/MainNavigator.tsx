import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Colors } from '../constants/Colors';

// Import screens (we'll create these later)
import DashboardScreen from '../screens/main/DashboardScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import TeamsScreen from '../screens/main/TeamsScreen';
import AddProjectScreen from '../screens/projects/AddProjectScreen';
import EditProjectScreen from '../screens/projects/EditProjectScreen';
import ViewProjectScreen from '../screens/projects/ViewProjectScreen';

// Tab navigator types
export type MainTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Teams: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

// Stack navigator types
export type MainStackParamList = {
  MainTabs: undefined;
  Notifications: undefined;
  Settings: undefined;
  AddProject: undefined;
  ViewProject: { projectId: string };
  EditProject: { projectId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

// Tab Navigator Component
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Projects':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'Teams':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.tab.active,
        tabBarInactiveTintColor: Colors.tab.inactive,
        tabBarStyle: {
          backgroundColor: Colors.tab.background,
          borderTopColor: Colors.tab.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Navigator with Stack
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            color: Colors.text,
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            color: Colors.text,
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen name="AddProject" component={AddProjectScreen} />
      <Stack.Screen name="ViewProject" component={ViewProjectScreen} />
      <Stack.Screen name="EditProject" component={EditProjectScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
