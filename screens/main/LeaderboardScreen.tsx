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

const LeaderboardScreen: React.FC = () => {
  const topThree = [
    { rank: 1, name: 'Alex Chen', points: 2847, avatar: '👨‍💻', crown: '#FFD700' },
    { rank: 2, name: 'Sarah Kim', points: 2691, avatar: '👩‍💻', crown: '#C0C0C0' },
    { rank: 3, name: 'Mike Rodriguez', points: 2534, avatar: '👨‍🔬', crown: '#CD7F32' },
  ];

  const leaderboardData = [
    { rank: 4, name: 'Emma Wilson', points: 2387, avatar: '👩‍🚀', status: 'up' },
    { rank: 5, name: 'David Park', points: 2254, avatar: '👨‍⚡', status: 'down' },
    { rank: 6, name: 'Lisa Zhang', points: 2198, avatar: '👩‍🔬', status: 'up' },
    { rank: 7, name: 'James Cooper', points: 2156, avatar: '👨‍💼', status: 'same' },
    { rank: 8, name: 'Maria Santos', points: 2089, avatar: '👩‍💻', status: 'up' },
    { rank: 9, name: 'Ryan Lee', points: 1987, avatar: '👨‍🎨', status: 'down' },
    { rank: 10, name: 'Nina Patel', points: 1923, avatar: '👩‍⚡', status: 'up' },
  ];

  const stats = [
    { label: 'Your Rank', value: '#15', icon: 'trophy' },
    { label: 'Your Points', value: '1,756', icon: 'star' },
    { label: 'This Week', value: '+124', icon: 'trending-up' },
    { label: 'Global Users', value: '12.3K', icon: 'globe' },
  ];

  const renderFloatingOrbs = () => (
    <>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
      <View style={[styles.floatingOrb, styles.orb3]} />
    </>
  );

  const renderTopThreeCard = (user: any, index: number) => (
    <View key={user.rank} style={[styles.topThreeCard, index === 0 && styles.winnerCard]}>
      <View style={styles.crownContainer}>
        <Text style={[styles.crown, { color: user.crown }]}>👑</Text>
      </View>
      <View style={[styles.avatarContainer, { borderColor: user.crown }]}>
        <Text style={styles.avatar}>{user.avatar}</Text>
      </View>
      <Text style={styles.topThreeName}>{user.name}</Text>
      <Text style={styles.topThreePoints}>{user.points.toLocaleString()}</Text>
      <View style={[styles.rankBadge, { backgroundColor: user.crown + '40' }]}>
        <Text style={styles.rankText}>#{user.rank}</Text>
      </View>
    </View>
  );

  const renderLeaderboardItem = (user: any) => (
    <TouchableOpacity key={user.rank} style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankNumber}>#{user.rank}</Text>
      </View>
      <View style={styles.userAvatar}>
        <Text style={styles.avatarEmoji}>{user.avatar}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userPoints}>{user.points.toLocaleString()} pts</Text>
      </View>
      <View style={styles.statusContainer}>
        <Ionicons 
          name={user.status === 'up' ? 'chevron-up' : user.status === 'down' ? 'chevron-down' : 'remove'} 
          size={16} 
          color={user.status === 'up' ? '#10B981' : user.status === 'down' ? '#EF4444' : '#9CA3AF'} 
        />
      </View>
    </TouchableOpacity>
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
            <Text style={styles.title}>LEADERBOARD</Text>
            <Text style={styles.subtitle}>Top cyber hunters</Text>
          </View>
        </View>

        {/* Your Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => renderStatCard(stat, index))}
        </View>

        {/* Top 3 Podium */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hall of Fame</Text>
          <View style={styles.topThreeContainer}>
            {topThree.map((user, index) => renderTopThreeCard(user, index))}
          </View>
        </View>

        {/* Full Leaderboard */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Full Rankings</Text>
          <View style={styles.leaderboardContainer}>
            {leaderboardData.map(renderLeaderboardItem)}
          </View>
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
    top: 150,
    right: -50,
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 300,
    left: -80,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  orb3: {
    width: 120,
    height: 120,
    top: 400,
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
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  topThreeCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    minHeight: 180,
  },
  winnerCard: {
    borderColor: 'rgba(255, 215, 0, 0.5)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  crownContainer: {
    marginBottom: 8,
  },
  crown: {
    fontSize: 24,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  avatar: {
    fontSize: 24,
  },
  topThreeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  topThreePoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22d3ee',
    marginBottom: 8,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userPoints: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusContainer: {
    width: 24,
    alignItems: 'center',
  },
});

export default LeaderboardScreen;
