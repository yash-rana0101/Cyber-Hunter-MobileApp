import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import UserProfileAvatar from '../../components/ui/UserProfileAvatar';

const { width } = Dimensions.get('window');

const TeamsScreen: React.FC = () => {
  const teamStats = [
    { label: 'Team Members', value: '24', icon: 'people' },
    { label: 'Active Projects', value: '12', icon: 'folder' },
    { label: 'Completed', value: '38', icon: 'checkmark-circle' },
    { label: 'Team Rank', value: '#3', icon: 'trophy' },
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

  const recentTeams = [
    { id: 1, name: 'Quantum Defenders', members: 8, status: 'active', badge: 'gold' },
    { id: 2, name: 'Cyber Phoenix', members: 12, status: 'active', badge: 'silver' },
    { id: 3, name: 'Digital Warriors', members: 6, status: 'recruiting', badge: 'bronze' },
  ];

  const renderFloatingOrbs = () => (
    <>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
      <View style={[styles.floatingOrb, styles.orb3]} />
    </>
  );

  const renderStatCard = (stat: any, index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={stat.icon as any} size={20} color="#22d3ee" />
      </View>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
    </View>
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
      style={styles.actionCard}
      onPress={() => handleActionPress(action.id)}
    >
      <View style={[styles.actionIconContainer, getGradientStyle(action.gradient)]}>
        <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  const renderTeamCard = (team: any) => (
    <TouchableOpacity key={team.id} style={styles.teamCard}>
      <View style={styles.teamCardHeader}>
        <View style={[styles.teamBadge, getBadgeStyle(team.badge)]}>
          <View style={styles.teamBadgeInner} />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamMembers}>{team.members} members</Text>
        </View>
        <View style={[styles.statusBadge, team.status === 'active' ? styles.activeBadge : styles.recruitingBadge]}>
          <Text style={styles.statusText}>{team.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <UserProfileAvatar size="medium" />
            
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
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>TEAMS</Text>
            <Text style={styles.subtitle}>Collaborate with elite hackers</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {teamStats.map((stat, index) => renderStatCard(stat, index))}
        </View>

        {/* Action Cards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Team Actions</Text>
          <View style={styles.actionsGrid}>
            {teamActions.map(renderActionCard)}
          </View>
        </View>

        {/* Recent Teams */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Teams</Text>
          {recentTeams.map(renderTeamCard)}
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
});

export default TeamsScreen;
