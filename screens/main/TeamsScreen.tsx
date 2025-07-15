import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MainScreenHeader from '../../components/ui/MainScreenHeader';
import { Team, useTeam } from '../../context/TeamContext';
import { projectService, teamService } from '../../services/api';

const { width } = Dimensions.get('window');

const TeamsScreen: React.FC = () => {
  const { teams, userTeam, isLoading, loadTeams } = useTeam();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamRank: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animation setup
  useEffect(() => {
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

  // Load user teams and stats
  const loadUserTeamsAndStats = useCallback(async () => {
    try {
      // Load user's teams
      const userTeamsResponse = await teamService.getUserTeams();
      if (userTeamsResponse?.data) {
        setUserTeams(userTeamsResponse.data);
        
        // Calculate stats
        const totalMembers = userTeamsResponse.data.reduce(
          (acc: number, team: Team) => acc + team.TeamMembers.length, 0
        );
        
        // Get team projects for active projects count
        let activeProjects = 0;
        for (const team of userTeamsResponse.data) {
          try {
            const projectsResponse = await projectService.getTeamProjects(team._id);
            if (projectsResponse?.data) {
              activeProjects += projectsResponse.data.filter((p: any) => p.status === 'active').length;
            }
          } catch {
            console.log('Could not load projects for team:', team._id);
          }
        }
        
        setTeamStats({
          totalMembers,
          activeProjects,
          completedProjects: 0, // Will be calculated based on project status
          teamRank: userTeamsResponse.data.length > 0 ? userTeamsResponse.data[0].points || 0 : 0,
        });
      }
    } catch (error) {
      console.error('Error loading user teams and stats:', error);
    }
  }, []);

  useEffect(() => {
    loadTeams();
    loadUserTeamsAndStats();
  }, [loadTeams, loadUserTeamsAndStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeams();
    await loadUserTeamsAndStats();
    setRefreshing(false);
  }, [loadTeams, loadUserTeamsAndStats]);

  const teamStatsData = [
    { label: 'Team Members', value: teamStats.totalMembers.toString(), icon: 'people' },
    { label: 'Active Projects', value: teamStats.activeProjects.toString(), icon: 'folder' },
    { label: 'Your Teams', value: userTeams.length.toString(), icon: 'checkmark-circle' },
    { label: 'Team Points', value: teamStats.teamRank.toString(), icon: 'trophy' },
  ];

  const teamActions = [
    {
      id: 1,
      title: 'Create Team',
      description: 'Start a new team project',
      icon: 'add-circle',
      gradient: 'cyan',
    },
    {
      id: 2,
      title: 'Join Team',
      description: 'Browse available teams',
      icon: 'enter',
      gradient: 'purple',
    },
    {
      id: 3,
      title: 'Team Chat',
      description: 'Communicate with members',
      icon: 'chatbubbles',
      gradient: 'orange',
    },
    {
      id: 4,
      title: 'View Projects',
      description: 'Browse team projects',
      icon: 'grid',
      gradient: 'green',
    },
  ];

  const renderFloatingOrbs = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
      <View style={[styles.floatingOrb, styles.orb3]} />
    </Animated.View>
  );

  const renderStatCard = (stat: any, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.statCard,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={stat.icon as any} size={20} color="#22d3ee" />
      </View>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
    </Animated.View>
  );

  const getGradientStyle = (gradient: string) => {
    switch (gradient) {
      case 'cyan': return styles.cyanGradient;
      case 'purple': return styles.purpleGradient;
      case 'orange': return styles.orangeGradient;
      case 'green': return styles.greenGradient;
      default: return styles.cyanGradient;
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'gold': return styles.goldBadge;
      case 'silver': return styles.silverBadge;
      case 'bronze': return styles.bronzeBadge;
      default: return styles.goldBadge;
    }
  };

  const renderActionCard = (action: any) => (
    <TouchableOpacity 
      key={action.id} 
      style={[styles.actionCard, {
        transform: [{ translateY: slideAnim }],
      }]}
      onPress={() => handleActionPress(action.id)}
    >
      <View style={[styles.actionIconContainer, getGradientStyle(action.gradient)]}>
        <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  const renderTeamCard = (team: Team) => (
    <Animated.View
      key={team._id}
      style={[
        styles.teamCard,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity onPress={() => router.push(`/team-details/${team._id}` as any)}>
        <View style={styles.teamCardHeader}>
          <View style={[styles.teamBadge, getBadgeStyle('gold')]}>
            <View style={styles.teamBadgeInner} />
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.TeamName}</Text>
            <Text style={styles.teamMembers}>{team.TeamMembers.length} members</Text>
          </View>
          <View style={[styles.statusBadge, styles.activeBadge]}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
        <Text style={styles.teamDescription} numberOfLines={2}>
          {team.TeamDescription || 'No description available'}
        </Text>
        <View style={styles.teamTechStack}>
          {team.techStack.slice(0, 3).map((tech, index) => (
            <View key={index} style={styles.techTag}>
              <Text style={styles.techTagText}>{tech}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const handleActionPress = (actionId: number) => {
    switch (actionId) {
      case 1: // Create Team
        router.push('/create-team');
        break;
      case 2: // Join Team
        router.push('/join-team');
        break;
      case 3: // Team Chat
        router.push('/team-chat');
        break;
      case 4: // View Projects
        router.push('/team-projects');
        break;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <MainScreenHeader
          title="TEAMS"
          subtitle="Collaborate with elite hackers"
        />

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {teamStatsData.map((stat, index) => renderStatCard(stat, index))}
        </View>

        {/* Action Cards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Team Actions</Text>
          <View style={styles.actionsGrid}>
            {teamActions.map(renderActionCard)}
          </View>
        </View>

        {/* Your Teams */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Teams</Text>
          {userTeams.length > 0 ? (
            userTeams.map(renderTeamCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#374151" />
              <Text style={styles.emptyStateText}>No teams yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create or join a team to get started
              </Text>
            </View>
          )}
        </View>
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
  orb3: {
    width: 120,
    height: 120,
    top: 300,
    left: width - 80,
    backgroundColor: 'rgba(236, 38, 143, 0.06)',
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
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#22d3ee',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 20,
    width: (width - 44) / 2,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cyanGradient: {
    backgroundColor: 'rgba(34, 211, 238, 0.8)',
  },
  purpleGradient: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
  },
  orangeGradient: {
    backgroundColor: 'rgba(249, 115, 22, 0.8)',
  },
  greenGradient: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goldBadge: {
    borderColor: '#FCD34D',
  },
  silverBadge: {
    borderColor: '#9CA3AF',
  },
  bronzeBadge: {
    borderColor: '#F97316',
  },
  teamBadgeInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  teamMembers: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  recruitingBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  // New styles for dynamic content
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  teamDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  teamTechStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  techTag: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  techTagText: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TeamsScreen;
