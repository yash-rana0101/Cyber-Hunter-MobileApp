import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  doNotDisturbUntil: string | null;
  types: {
    all: boolean;
    messages: boolean;
    system: boolean;
    team: boolean;
    project: boolean;
  };
}

const NotificationSettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sound: true,
    doNotDisturbUntil: null,
    types: {
      all: true,
      messages: true,
      system: true,
      team: true,
      project: true,
    },
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/user/notification-settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notification settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      setUpdating(true);
      const response = await api.patch('/api/v1/user/notification-settings', newSettings);
      setSettings(response.data.data);
      Toast.show({
        type: 'success',
        text1: 'Settings Updated',
        text2: 'Your notification preferences have been saved',
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update notification settings',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...settings };
    
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (parent === 'types') {
        newSettings.types = { ...newSettings.types, [child]: value };
      }
    } else {
      (newSettings as any)[key] = value;
    }
    
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleMuteAll = () => {
    Alert.alert(
      'Mute All Notifications',
      'This will disable all notifications. You can re-enable them anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mute All',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/api/v1/user/notification-settings/mute-all');
              await fetchNotificationSettings();
              Toast.show({
                type: 'success',
                text1: 'Notifications Muted',
                text2: 'All notifications have been disabled',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to mute notifications',
              });
            }
          },
        },
      ]
    );
  };

  const handleDoNotDisturb = () => {
    Alert.alert(
      'Do Not Disturb',
      'How long would you like to enable Do Not Disturb mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '1 Hour',
          onPress: () => enableDoNotDisturb(1),
        },
        {
          text: '4 Hours',
          onPress: () => enableDoNotDisturb(4),
        },
        {
          text: '8 Hours',
          onPress: () => enableDoNotDisturb(8),
        },
      ]
    );
  };

  const enableDoNotDisturb = async (hours: number) => {
    try {
      await api.post('/api/v1/user/notification-settings/do-not-disturb', { hours });
      await fetchNotificationSettings();
      Toast.show({
        type: 'success',
        text1: 'Do Not Disturb Enabled',
        text2: `Notifications will be silenced for ${hours} hour${hours > 1 ? 's' : ''}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to enable Do Not Disturb',
      });
    }
  };

  const renderFloatingOrbs = () => (
    <>
      <Animated.View 
        entering={FadeInUp.delay(500).duration(2000)}
        style={[styles.floatingOrb, styles.orb1]} 
      />
      <Animated.View 
        entering={FadeInDown.delay(800).duration(2000)}
        style={[styles.floatingOrb, styles.orb2]} 
      />
    </>
  );

  const renderToggleItem = (
    icon: string,
    title: string,
    subtitle: string,
    key: string,
    value: boolean
  ) => (
    <Animated.View 
      entering={SlideInRight.delay(200).duration(600)}
      style={styles.settingItem}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#22d3ee" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleToggle(key, newValue)}
        trackColor={{ false: '#374151', true: '#22d3ee' }}
        thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        disabled={updating}
      />
    </Animated.View>
  );

  const renderActionItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    danger?: boolean
  ) => (
    <Animated.View entering={SlideInRight.delay(200).duration(600)}>
      <TouchableOpacity
        style={[styles.settingItem, danger && styles.dangerItem]}
        onPress={onPress}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={danger ? '#EF4444' : '#22d3ee'} 
            />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, danger && styles.dangerText]}>
              {title}
            </Text>
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );

  const isDoNotDisturbActive = settings.doNotDisturbUntil && 
    new Date(settings.doNotDisturbUntil) > new Date();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800)}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Do Not Disturb Status */}
        {isDoNotDisturbActive && (
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800)}
            style={styles.dndBanner}
          >
            <Ionicons name="moon" size={20} color="#F59E0B" />
            <Text style={styles.dndText}>
              Do Not Disturb is active until {new Date(settings.doNotDisturbUntil!).toLocaleString()}
            </Text>
          </Animated.View>
        )}

        {/* General Settings */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.sectionContent}>
            {renderToggleItem(
              'mail',
              'Email Notifications',
              'Receive notifications via email',
              'email',
              settings.email
            )}
            {renderToggleItem(
              'notifications',
              'Push Notifications',
              'Receive push notifications on your device',
              'push',
              settings.push
            )}
            {renderToggleItem(
              'volume-high',
              'Sound',
              'Play sound for notifications',
              'sound',
              settings.sound
            )}
          </View>
        </Animated.View>

        {/* Notification Types */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.sectionContent}>
            {renderToggleItem(
              'checkmark-circle',
              'All Notifications',
              'Enable all notification types',
              'types.all',
              settings.types.all
            )}
            {renderToggleItem(
              'chatbubble',
              'Messages',
              'Team chat and direct messages',
              'types.messages',
              settings.types.messages
            )}
            {renderToggleItem(
              'settings',
              'System',
              'System updates and maintenance',
              'types.system',
              settings.types.system
            )}
            {renderToggleItem(
              'people',
              'Team',
              'Team invitations and updates',
              'types.team',
              settings.types.team
            )}
            {renderToggleItem(
              'folder',
              'Projects',
              'Project updates and deadlines',
              'types.project',
              settings.types.project
            )}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInUp.delay(500).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.sectionContent}>
            {renderActionItem(
              'moon',
              'Do Not Disturb',
              'Temporarily disable notifications',
              handleDoNotDisturb
            )}
            {renderActionItem(
              'volume-off',
              'Mute All Notifications',
              'Disable all notifications',
              handleMuteAll,
              true
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: 'rgba(0, 216, 255, 0.1)',
  },
  orb1: {
    width: 150,
    height: 150,
    top: 100,
    right: -50,
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 200,
    left: -80,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
  },
  dndBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  dndText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  dangerItem: {
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default NotificationSettingsScreen;
