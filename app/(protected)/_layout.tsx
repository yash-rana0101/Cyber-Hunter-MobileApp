import { Stack } from 'expo-router';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ProtectedLayout() {
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
  const tintColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  return (
    <ProtectedRoute>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor,
          },
          headerTintColor: tintColor,
        }}
      >
        <Stack.Screen
          name="create-project"
          options={{
            title: 'Create Project',
          }}
        />
        <Stack.Screen
          name="create-team"
          options={{
            title: 'Create Team',
          }}
        />
        <Stack.Screen
          name="join-team"
          options={{
            title: 'Join Team',
          }}
        />
        <Stack.Screen
          name="team-chat"
          options={{
            title: 'Team Chat',
          }}
        />
        <Stack.Screen
          name="team-projects"
          options={{
            title: 'Team Projects',
          }}
        />
        <Stack.Screen
          name="view-project"
          options={{
            title: 'Project Details',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notifications',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}
