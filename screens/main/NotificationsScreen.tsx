import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInLeft } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  actionRequired?: boolean;
}

const NotificationsScreen: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/notifications');
      
      if (response.data && response.data.data) {
        const { notifications: newNotifications, unreadCount: newUnreadCount } = response.data.data;
        setNotifications(newNotifications || []);
        setUnreadCount(newUnreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notifications',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter change handler
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark notification as read',
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/api/v1/notifications/${notificationId}`);
      
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
      
      Toast.show({
        type: 'success',
        text1: 'Notification deleted',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete notification',
      });
    }
  };

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.link) {
      router.push(notification.link as any);
    }
  };

  // Handle notification long press
  const handleNotificationLongPress = (notification: Notification) => {
    Alert.alert(
      'Notification Options',
      notification.title,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: notification.isRead ? 'Mark as Unread' : 'Mark as Read',
          onPress: () => markAsRead(notification._id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notification._id),
        },
      ]
    );
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'info': return 'information-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      default: return 'notifications';
    }
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'info': return '#22d3ee';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  // Render notification item
  const renderNotification = (notification: Notification, index: number) => (
    <Animated.View
      key={notification._id}
      entering={SlideInLeft.delay(index * 100).duration(600)}
    >
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !notification.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleNotificationLongPress(notification)}
      >
        <View style={styles.notificationLeft}>
          <View style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(notification.type) + '40' }
          ]}>
            <Ionicons 
              name={getNotificationIcon(notification.type) as any} 
              size={20} 
              color={getNotificationColor(notification.type)} 
            />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <View style={styles.notificationFooter}>
              <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
              {notification.category && (
                <Text style={styles.notificationCategory}>
                  {notification.category}
                </Text>
              )}
            </View>
          </View>
        </View>
        {notification.actionRequired && (
          <View style={styles.actionRequiredBadge}>
            <Ionicons name="alert" size={12} color="#F59E0B" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight} />
        </Animated.View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22d3ee"
          />
        }
      >
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(800)}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
            onPress={() => handleFilterChange('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Notifications List */}
        <View style={styles.notificationsContainer}>
          {filteredNotifications.map((notification, index) => renderNotification(notification, index))}
        </View>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <Animated.View 
            entering={FadeInUp.delay(500).duration(800)}
            style={styles.emptyState}
          >
            <Ionicons name="notifications-off" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateText}>
              {filter === 'unread' ? 'All notifications have been read' : 'You are all caught up!'}
            </Text>
          </Animated.View>
        )}
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
    fontSize: 24,
    fontWeight: '700',
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#22d3ee',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeFilterText: {
    color: '#000000',
  },
  notificationsContainer: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  unreadNotification: {
    borderColor: 'rgba(34, 211, 238, 0.3)',
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  notificationCategory: {
    fontSize: 12,
    color: '#22d3ee',
    fontWeight: '500',
  },
  actionRequiredBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
