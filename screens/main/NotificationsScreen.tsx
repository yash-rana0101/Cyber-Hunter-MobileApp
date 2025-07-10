import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const NotificationsScreen: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Project Completed',
      message: 'Network Security Audit has been successfully completed',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      type: 'info',
      title: 'Team Invitation',
      message: 'You have been invited to join Alpha Squad',
      time: '4 hours ago',
      unread: true,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Deadline Reminder',
      message: 'Vulnerability Scanner project due in 2 days',
      time: '6 hours ago',
      unread: true,
    },
    {
      id: 4,
      type: 'update',
      title: 'System Update',
      message: 'New features available in the cybersecurity dashboard',
      time: '1 day ago',
      unread: false,
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'You earned the "Network Guardian" badge',
      time: '2 days ago',
      unread: false,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'info': return 'information-circle';
      case 'warning': return 'warning';
      case 'update': return 'refresh-circle';
      case 'achievement': return 'trophy';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'info': return '#22d3ee';
      case 'warning': return '#F59E0B';
      case 'update': return '#8B5CF6';
      case 'achievement': return '#FFD700';
      default: return '#9CA3AF';
    }
  };

  const renderFloatingOrbs = () => (
    <>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
    </>
  );

  const renderNotification = (notification: any) => (
    <TouchableOpacity key={notification.id} style={styles.notificationCard}>
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
            {notification.unread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationAction}>
        <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.unread;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
              Unread ({notifications.filter(n => n.unread).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsContainer}>
          {filteredNotifications.map(renderNotification)}
        </View>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateText}>
              {filter === 'unread' ? 'All notifications have been read' : 'You\'re all caught up!'}
            </Text>
          </View>
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    color: '#22d3ee',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  activeFilterTab: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderColor: '#22d3ee',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#22d3ee',
  },
  notificationsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#EF4444',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
