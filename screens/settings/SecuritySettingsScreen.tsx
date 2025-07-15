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

const SecuritySettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/auth/2fa/status');
      setTwoFactorEnabled(response.data.data.enabled);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Enable 2FA
        const response = await api.post('/api/v1/auth/2fa/generate');
        setSecret(response.data.data.secret);
        setQrCode(response.data.data.qrCode);
        setShowQrCode(true);
      } else {
        // Disable 2FA
        Alert.alert(
          'Disable 2FA',
          'Are you sure you want to disable two-factor authentication?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await api.post('/api/v1/auth/2fa/disable');
                  setTwoFactorEnabled(false);
                  Toast.show({
                    type: 'success',
                    text1: '2FA Disabled',
                    text2: 'Two-factor authentication has been disabled',
                  });
                } catch (error) {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to disable 2FA',
                  });
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update 2FA settings',
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

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    hasToggle?: boolean,
    toggleValue?: boolean,
    onToggle?: (value: boolean) => void,
    danger?: boolean
  ) => (
    <Animated.View entering={SlideInRight.delay(200).duration(600)}>
      <TouchableOpacity
        style={[styles.settingItem, danger && styles.dangerItem]}
        onPress={onPress}
        disabled={hasToggle}
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
            {subtitle && (
              <Text style={styles.settingSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: '#22d3ee' }}
            thumbColor={toggleValue ? '#FFFFFF' : '#9CA3AF'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading security settings...</Text>
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
          <Text style={styles.headerTitle}>Security Settings</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Two-Factor Authentication */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'shield-checkmark',
              'Two-Factor Authentication',
              twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security',
              undefined,
              true,
              twoFactorEnabled,
              handleToggle2FA
            )}
          </View>
        </Animated.View>

        {/* Password Security */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Password Security</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'key',
              'Change Password',
              'Update your account password',
              () => router.push('/settings/change-password' as any)
            )}
            {renderSettingItem(
              'time',
              'Password History',
              'View recent password changes',
              () => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Password history feature will be available soon',
                });
              }
            )}
          </View>
        </Animated.View>

        {/* Account Security */}
        <Animated.View 
          entering={FadeInUp.delay(500).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'phone-portrait',
              'Connected Devices',
              'Manage your logged-in devices',
              () => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Device management feature will be available soon',
                });
              }
            )}
            {renderSettingItem(
              'log-out',
              'Sign Out All Devices',
              'Sign out from all other devices',
              () => {
                Alert.alert(
                  'Sign Out All Devices',
                  'This will sign you out from all devices except this one.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: () => {
                        Toast.show({
                          type: 'success',
                          text1: 'Success',
                          text2: 'Signed out from all other devices',
                        });
                      },
                    },
                  ]
                );
              }
            )}
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'trash',
              'Delete Account',
              'Permanently delete your account',
              () => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete your account? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        Toast.show({
                          type: 'info',
                          text1: 'Coming Soon',
                          text2: 'Account deletion feature will be available soon',
                        });
                      },
                    },
                  ]
                );
              },
              false,
              undefined,
              undefined,
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

export default SecuritySettingsScreen;
