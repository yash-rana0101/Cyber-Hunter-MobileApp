import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import UserProfileAvatar from './UserProfileAvatar';

interface MainScreenHeaderProps {
  title: string;
  subtitle: string;
  showProfileButton?: boolean;
  showNotificationButton?: boolean;
  notificationCount?: number;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  fadeAnim?: Animated.Value;
  slideAnim?: Animated.Value;
  style?: object;
}

const MainScreenHeader: React.FC<MainScreenHeaderProps> = ({
  title,
  subtitle,
  showProfileButton = true,
  showNotificationButton = true,
  notificationCount = 3,
  onProfilePress,
  onNotificationPress,
  fadeAnim,
  slideAnim,
  style,
}) => {
  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/profile');
    }
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/notifications');
    }
  };

  const animatedStyle = {
    opacity: fadeAnim || 1,
    transform: slideAnim ? [{ translateY: slideAnim }] : [],
  };

  return (
    <Animated.View style={[styles.header, animatedStyle, style]}>
      <View style={styles.headerTop}>
        {showProfileButton && (
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <LinearGradient
              colors={['#22d3ee', '#3b82f6']}
              style={styles.profileAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <UserProfileAvatar size="medium" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {showNotificationButton && (
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications" size={24} color="#22d3ee" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    padding: 6,
    borderRadius: 24,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ec2653',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default MainScreenHeader;
