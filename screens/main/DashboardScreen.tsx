import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CyberButton from '../../components/ui/CyberButton';
import GlassCard from '../../components/ui/GlassCard';
import UserProfileAvatar from '../../components/ui/UserProfileAvatar';
import { Colors } from '../../constants/Colors';
import { AppDispatch, RootState } from '../../store';
import { resetOnboardingCompleted } from '../../store/slices/authSlice';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset App',
      'This will reset the app to show onboarding again. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(resetOnboardingCompleted());
          },
        },
      ]
    );
  };
  return (
    <LinearGradient
      colors={[Colors.background, '#1a1a1a', Colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <UserProfileAvatar size="medium" />
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={() => router.push('/notifications')}
                >
                  <Ionicons name="notifications" size={24} color="#22d3ee" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.headerContent}>
              <Text style={styles.title}>DASHBOARD</Text>
              <Text style={styles.subtitle}>Welcome back, Hunter</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard} glowEffect>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </GlassCard>

            <GlassCard style={styles.statCard} glowEffect>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </GlassCard>

            <GlassCard style={styles.statCard} glowEffect>
              <Text style={styles.statNumber}>#42</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </GlassCard>

            <GlassCard style={styles.statCard} glowEffect>
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>Score</Text>
            </GlassCard>
          </View>

          {/* Recent Activity */}
          <GlassCard style={styles.activityCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Created new project &quot;Cyber Portal&quot;</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Joined team &quot;Elite Hackers&quot;</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Earned &quot;JavaScript Master&quot; badge</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <CyberButton
                title="New Project"
                onPress={() => {}}
                variant="primary"
                size="medium"
                style={styles.actionButton}
              />
              <CyberButton
                title="Join Team"
                onPress={() => {}}
                variant="outline"
                size="medium"
                style={styles.actionButton}
              />
            </View>
          </GlassCard>

          {/* Development Panel */}
          {__DEV__ && (
            <GlassCard style={styles.devCard}>
              <Text style={styles.sectionTitle}>🛠 Development Panel</Text>
              <Text style={styles.devText}>
                Logged in as: {auth.user?.email || 'Unknown'}
              </Text>
              <View style={styles.devActions}>
                <TouchableOpacity
                  style={styles.devButton}
                  onPress={handleResetOnboarding}
                >
                  <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.devButtonText}>Reset Onboarding</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  profileAvatarText: {
    fontSize: 22,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(34, 211, 238, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#22d3ee',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  activityText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsCard: {},
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  devCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  devText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  devActions: {
    flexDirection: 'row',
    gap: 12,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  devButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default DashboardScreen;
