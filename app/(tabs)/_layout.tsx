import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.glass.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...Platform.select({
            ios: {
              shadowColor: Colors.brand.primary,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false, // Remove header to eliminate white gaps
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Projects',
            tabBarIcon: ({ color }) => <Ionicons name="folder" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'Teams',
            tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Leaderboard',
            tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
          }}
        />
      </Tabs>
  );
}
