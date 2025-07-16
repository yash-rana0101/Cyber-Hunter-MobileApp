import { Ionicons } from '@expo/vector-icons';
// Remove LinearGradient import
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../components/ui/GlassCard';

import { router } from 'expo-router';
import MainScreenHeader from '../../components/ui/MainScreenHeader';
import { Colors } from '../../constants/Colors';
import { leaderboardService } from '../../services/leaderboard';
import { AppDispatch, RootState } from '../../store';
import { resetOnboardingCompleted } from '../../store/slices/authSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { fetchMyProjects } from '../../store/slices/projectSlice';
import { fetchMyTeams } from '../../store/slices/teamSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const auth = useSelector((state: RootState) => state.auth);
  const user = useSelector((state: RootState) => state.user);
  const projects = useSelector((state: RootState) => state.projects);
  const teams = useSelector((state: RootState) => state.teams);
  const notifications = useSelector((state: RootState) => state.notifications);
  
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const generateRecentActivity = useCallback(() => {
    const activities = [];
    
    // Add project activities
    if (projects.myProjects && projects.myProjects.length > 0) {
      projects.myProjects.slice(0, 2).forEach(project => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project',
          title: 'Project created',
          description: `"${project.title}"`,
          time: formatTimeAgo(project.createdAt),
          icon: 'code-working',
          color: Colors.brand.primary,
        });
      });
    }
    
    // Add team activities
    if (teams.myTeams && teams.myTeams.length > 0) {
      teams.myTeams.slice(0, 2).forEach(team => {
        activities.push({
          id: `team-${team.id}`,
          type: 'team',
          title: 'Joined team',
          description: `"${team.name}"`,
          time: formatTimeAgo(team.createdAt),
          icon: 'people',
          color: Colors.brand.secondary,
        });
      });
    }
    
    // Add default activities if no real data
    if (activities.length === 0) {
      activities.push(
        {
          id: '1',
          type: 'project',
          title: 'Get started',
          description: 'Create your first project',
          time: 'Just now',
          icon: 'code-working',
          color: Colors.brand.primary,
        },
        {
          id: '2',
          type: 'team',
          title: 'Join a team',
          description: 'Collaborate with others',
          time: 'Just now',
          icon: 'people',
          color: Colors.brand.secondary,
        }
      );
    }
    
    setRecentActivity(activities.slice(0, 4));
  }, [projects.myProjects, teams.myTeams]);

  const loadDashboardData = useCallback(async () => {
    try {
      // Fetch user data
      if (auth.user) {
        dispatch(fetchUserProfile(auth.user.id));
        dispatch(fetchMyProjects());
        dispatch(fetchMyTeams());
        dispatch(fetchNotifications({}));
      }
      
      // Fetch leaderboard top users
      try {
        const leaderboardData = await leaderboardService.getLeaderboard({
          type: 'individual',
          limit: 3,
        });
        setTopUsers(leaderboardData.topThree || []);
      } catch (error) {
        console.log('Failed to fetch leaderboard:', error);
      }
      
      // Generate recent activity (you can replace this with real API data)
      generateRecentActivity();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [auth.user, dispatch, generateRecentActivity]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, [loadDashboardData, startAnimations]);

  // Update recent activity when projects or teams change
  useEffect(() => {
    generateRecentActivity();
  }, [generateRecentActivity]);

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

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    trend?: number;
  }> = ({ title, value, icon, color, trend }) => (
    <GlassCard style={styles.statCard} glowEffect>
      <View style={styles.statCardContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{String(value)}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {trend !== undefined && trend !== 0 && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={trend > 0 ? 'trending-up' : 'trending-down'} 
                size={12} 
                color={trend > 0 ? '#10B981' : '#EF4444'} 
              />
              <Text style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </GlassCard>
    );
  
   const renderFloatingOrbs = () => {
      return (
        <>
          <Animated.View 
            style={[
              styles.floatingOrb, 
              styles.orb1,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingOrb, 
              styles.orb2,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingOrb, 
              styles.orb3,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]} 
          />
        </>
      );
    };

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
  }> = ({ title, description, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <GlassCard style={styles.quickActionCardContent} glowEffect>
        <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.quickActionText}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </GlassCard>
    </TouchableOpacity>
  );

  const ActivityItem: React.FC<{
    activity: any;
  }> = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
        <Ionicons name={activity.icon} size={16} color={activity.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title || 'Activity'}</Text>
        <Text style={styles.activityDescription}>{activity.description || 'No description'}</Text>
        <Text style={styles.activityTime}>{activity.time || 'Just now'}</Text>
      </View>
    </View>
  );

  const LeaderboardPreview: React.FC = () => (
    <GlassCard style={styles.leaderboardCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        <TouchableOpacity onPress={() => router.push('/leaderboard')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {topUsers && topUsers.length > 0 ? (
        <View style={styles.leaderboardList}>
          {topUsers.map((user, index) => (
            <View key={user.userId || index} style={styles.leaderboardItem}>
              <View style={styles.leaderboardRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.leaderboardUser}>
                <Text style={styles.leaderboardName}>{user.name || 'Unknown'}</Text>
                <Text style={styles.leaderboardPoints}>{user.points || 0} pts</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No leaderboard data available</Text>
      )}
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      {renderFloatingOrbs()}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.brand.primary}
              colors={[Colors.brand.primary]}
            />
          }
        >
          {/* Header */}
          <MainScreenHeader
            title="DASHBOARD"
            subtitle={`Welcome back, ${auth.user?.username || 'Hunter'}`}
          />

          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Stats Grid */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Projects"
                value={projects.myProjects?.length || 0}
                icon="folder"
                color={Colors.brand.primary}
                trend={projects.myProjects?.length > 0 ? 12 : 0}
              />
              <StatCard
                title="Teams"
                value={teams.myTeams?.length || 0}
                icon="people"
                color={Colors.brand.secondary}
                trend={teams.myTeams?.length > 0 ? 8 : 0}
              />
              <StatCard
                title="Rank"
                value={user.profile?.rank ? `#${user.profile.rank}` : 'N/A'}
                icon="trophy"
                color="#FFD700"
                trend={user.profile?.rank ? -2 : 0}
              />
              <StatCard
                title="Score"
                value={user.profile?.score || 0}
                icon="star"
                color={Colors.brand.accent}
                trend={(user.profile?.score || 0) > 0 ? 15 : 0}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <QuickActionCard
                  title="New Project"
                  description="Create a new project"
                  icon="add-circle"
                  color={Colors.brand.primary}
                  onPress={() => router.push('/create-project')}
                />
                <QuickActionCard
                  title="Join Team"
                  description="Find and join teams"
                  icon="people-circle"
                  color={Colors.brand.secondary}
                  onPress={() => router.push('/join-team')}
                />
              </View>
            </View>

            {/* Recent Projects */}
            <GlassCard style={styles.projectsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Recent Projects</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {projects.myProjects && projects.myProjects.length > 0 ? (
                <View style={styles.projectsList}>
                  {projects.myProjects.slice(0, 3).map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={styles.projectItem}
                      onPress={() => router.push(`/view-project?id=${project.id}`)}
                    >
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>{project.title || 'Untitled Project'}</Text>
                        <Text style={styles.projectDescription} numberOfLines={2}>
                          {project.shortDescription || project.description || 'No description available'}
                        </Text>
                        <View style={styles.projectMeta}>
                          <View style={styles.projectStats}>
                            <Ionicons name="heart" size={12} color={Colors.brand.primary} />
                            <Text style={styles.projectStatText}>{project.likes || 0}</Text>
                            <Ionicons name="eye" size={12} color={Colors.textSecondary} />
                            <Text style={styles.projectStatText}>{project.views || 0}</Text>
                          </View>
                          <Text style={styles.projectDate}>
                            {project.createdAt ? formatTimeAgo(project.createdAt) : 'Recently'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.projectStatus}>
                        <View style={[
                          styles.statusDot,
                          { backgroundColor: project.status === 'published' ? '#10B981' : '#F59E0B' }
                        ]} />
                        <Text style={styles.statusText}>{project.status || 'draft'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No projects yet. Create your first project!</Text>
              )}
            </GlassCard>

            {/* Recent Teams */}
            <GlassCard style={styles.teamsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>My Teams</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/teams')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {teams.myTeams && teams.myTeams.length > 0 ? (
                <View style={styles.teamsList}>
                  {teams.myTeams.slice(0, 3).map((team) => (
                    <TouchableOpacity
                      key={team.id}
                      style={styles.teamItem}
                      onPress={() => router.push(`/team-details/${team.id}`)}
                    >
                      <View style={styles.teamInfo}>
                        <Text style={styles.teamName}>{team.name || 'Unnamed Team'}</Text>
                        <Text style={styles.teamDescription} numberOfLines={1}>
                          {team.description || 'No description available'}
                        </Text>
                        <View style={styles.teamMeta}>
                          <View style={styles.teamStats}>
                            <Ionicons name="people" size={12} color={Colors.brand.secondary} />
                            <Text style={styles.teamStatText}>{team.memberCount || 0} members</Text>
                            <Ionicons name="folder" size={12} color={Colors.textSecondary} />
                            <Text style={styles.teamStatText}>{team.projectsCount || 0} projects</Text>
                          </View>
                          <Text style={styles.teamRank}>{team.rank ? `#${team.rank}` : 'N/A'}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No teams yet. Join or create a team!</Text>
              )}
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard style={styles.activityCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activityList}>
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No recent activity</Text>
                )}
              </View>
            </GlassCard>

            {/* Leaderboard Preview */}
            <LeaderboardPreview />

            {/* Notifications Preview */}
            <GlassCard style={styles.notificationsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {String(notifications.unreadCount || 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              {notifications.notifications && notifications.notifications.length > 0 ? (
                notifications.notifications.slice(0, 2).map((notification) => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <Ionicons
                      name={notification.type === 'achievement' ? 'trophy' : 'information-circle'}
                      size={16}
                      color={Colors.brand.primary}
                    />
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                    </View>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No new notifications</Text>
              )}
            </GlassCard>

            {/* Performance Chart Preview */}
            <GlassCard style={styles.performanceCard}>
              <Text style={styles.sectionTitle}>Performance Overview</Text>
              <View style={styles.performanceStats}>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceValue}>
                    {String(projects.myProjects?.filter(p => p.status === 'published').length || 0)}
                  </Text>
                  <Text style={styles.performanceLabel}>Published</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceValue}>
                    {String(projects.myProjects?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0)}
                  </Text>
                  <Text style={styles.performanceLabel}>Total Likes</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceValue}>
                    {String(projects.myProjects?.reduce((sum, p) => sum + (p.views || 0), 0) || 0)}
                  </Text>
                  <Text style={styles.performanceLabel}>Total Views</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  orb1: {
    width: 100,
    height: 100,
    top: 100,
    right: -50,
  },
  orb2: {
    width: 80,
    height: 80,
    top: 300,
    left: -40,
  },
  orb3: {
    width: 60,
    height: 60,
    top: 600,
    right: -20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    marginBottom: 8,
  },
  quickActionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    color: Colors.brand.primary,
    fontWeight: '500',
  },
  activityCard: {
    marginBottom: 24,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  leaderboardCard: {
    marginBottom: 24,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
  leaderboardUser: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  leaderboardPoints: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notificationsCard: {
    marginBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notificationBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
  },
  performanceCard: {
    marginBottom: 50,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  // Projects section styles
  projectsCard: {
    marginBottom: 24,
  },
  projectsList: {
    gap: 16,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectStatText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  projectDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  projectStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  // Teams section styles
  teamsCard: {
    marginBottom: 24,
  },
  teamsList: {
    gap: 16,
  },
  teamItem: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  teamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamStatText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  teamRank: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brand.primary,
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
