import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CyberButton from '../../components/ui/CyberButton';
import GlassCard from '../../components/ui/GlassCard';
import ScreenHeader from '../../components/ui/ScreenHeader';
// Colors imported but used in styles object at the bottom
import { teamService } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface Team {
  _id: string;
  TeamName: string;
  TeamDescription: string;
  TeamLogo: string;
  TeamMembers: {
    userId: string;
    role: string;
    status: string;
    points: number;
  }[];
  techStack: string[];
  interests: string[];
  points: number;
  TeamCreaterId: string;
  joinRequests?: {
    userId: string;
    status: string;
    requestedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const JoinTeamScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState<string | null>(null);
  const [userJoinRequests, setUserJoinRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, searchAnim]);

  // Load teams from backend
  const loadTeams = useCallback(async () => {
    try {
      setError(null);
      const response = await teamService.getAllTeams();
      if (response?.data) {
        setTeams(response.data);
        setFilteredTeams(response.data);
        
        // Extract unique categories from techStack and interests
        const allTechStack = response.data.flatMap((team: Team) => team.techStack || []);
        const allInterests = response.data.flatMap((team: Team) => team.interests || []);
        const uniqueCategories = ['All', ...new Set([...allTechStack, ...allInterests])];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user's join requests
  const loadUserJoinRequests = useCallback(async () => {
    try {
      const response = await teamService.getUserJoinRequests();
      if (response?.data) {
        setUserJoinRequests(response.data);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  }, []);

  useEffect(() => {
    loadTeams();
    loadUserJoinRequests();
  }, [loadTeams, loadUserJoinRequests]);

  // Filter teams based on search and category
  useEffect(() => {
    let filtered = teams;

    if (searchQuery.trim()) {
      filtered = filtered.filter(team => 
        team.TeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.TeamDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())) ||
        team.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(team => 
        team.techStack.includes(selectedCategory) || 
        team.interests.includes(selectedCategory)
      );
    }

    setFilteredTeams(filtered);
  }, [searchQuery, selectedCategory, teams]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeams();
    await loadUserJoinRequests();
    setRefreshing(false);
  }, [loadTeams, loadUserJoinRequests]);

  // Check if user has active join request for a team
  const hasActiveJoinRequest = (teamId: string) => {
    return userJoinRequests.some(request => 
      request.teamId === teamId && request.status === 'pending'
    );
  };

  const handleJoinTeam = async (team: Team) => {
    if (hasActiveJoinRequest(team._id)) {
      Alert.alert('Request Pending', 'You already have a pending request to join this team.');
      return;
    }
    
    Alert.alert(
      'Join Team',
      `Send a join request to ${team.TeamName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            setLoadingRequest(team._id);
            try {
              const response = await teamService.requestToJoinTeam(team._id);
              if (response?.success) {
                await loadUserJoinRequests(); // Refresh join requests
                Alert.alert('Success', 'Join request sent! The team will review your application.');
                
                // Animate card
                if (cardAnimations[team._id]) {
                  Animated.sequence([
                    Animated.timing(cardAnimations[team._id], {
                      toValue: 1.05,
                      duration: 150,
                      useNativeDriver: true,
                    }),
                    Animated.timing(cardAnimations[team._id], {
                      toValue: 1,
                      duration: 150,
                      useNativeDriver: true,
                    }),
                  ]).start();
                }
              }
            } catch (err) {
              console.error('Join request error:', err);
              Alert.alert('Error', 'Failed to send join request. Please try again.');
            } finally {
              setLoadingRequest(null);
            }
          },
        },
      ]
    );
  };

  const getCardAnimation = (teamId: string) => {
    if (!cardAnimations[teamId]) {
      cardAnimations[teamId] = new Animated.Value(1);
    }
    return cardAnimations[teamId];
  };

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedChip
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === category && styles.selectedChipText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderTeamCard = ({ item: team, index }: { item: Team; index: number }) => {
    const hasRequest = hasActiveJoinRequest(team._id);
    const cardScale = getCardAnimation(team._id);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: cardScale }
            ]
          }
        ]}
      >
        <GlassCard style={styles.teamCard}>
          <LinearGradient
            colors={['rgba(34, 211, 238, 0.1)', 'rgba(34, 211, 238, 0.05)']}
            style={styles.cardGradient}
          >
            {/* Team Header */}
            <View style={styles.teamHeader}>
              <View style={styles.teamLogoContainer}>
                <Image 
                  source={{ uri: team.TeamLogo || 'https://via.placeholder.com/60' }} 
                  style={styles.teamLogo}
                  defaultSource={require('../../assets/images/icon.png')}
                />
                <View style={styles.teamStatus}>
                  <View style={[styles.statusDot, { backgroundColor: team.TeamMembers.length < 5 ? '#10b981' : '#f59e0b' }]} />
                </View>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.TeamName}</Text>
                <View style={styles.teamMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="people" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{team.TeamMembers.length}/5</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.metaText}>{team.points || 0}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.teamBadge}>
                <LinearGradient
                  colors={['#22d3ee', '#06b6d4']}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeText}>TEAM</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Team Description */}
            <Text style={styles.teamDescription} numberOfLines={2}>
              {team.TeamDescription || 'No description available'}
            </Text>

            {/* Tech Stack */}
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>Tech Stack</Text>
              <View style={styles.tagsContainer}>
                {team.techStack.slice(0, 3).map((tech, index) => (
                  <View key={index} style={styles.techTag}>
                    <Text style={styles.tagText}>{tech}</Text>
                  </View>
                ))}
                {team.techStack.length > 3 && (
                  <View style={styles.moreTag}>
                    <Text style={styles.moreTagText}>+{team.techStack.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Interests */}
            {team.interests && team.interests.length > 0 && (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsTitle}>Interests</Text>
                <View style={styles.tagsContainer}>
                  {team.interests.slice(0, 2).map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.tagText}>{interest}</Text>
                    </View>
                  ))}
                  {team.interests.length > 2 && (
                    <View style={styles.moreTag}>
                      <Text style={styles.moreTagText}>+{team.interests.length - 2}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Join Button */}
            <TouchableOpacity
              style={[
                styles.joinButton,
                hasRequest && styles.pendingButton
              ]}
              onPress={() => handleJoinTeam(team)}
              disabled={hasRequest || loadingRequest === team._id}
            >
              {loadingRequest === team._id ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <LinearGradient
                  colors={hasRequest ? ['#6b7280', '#4b5563'] : ['#22d3ee', '#06b6d4']}
                  style={styles.joinButtonGradient}
                >
                  <Ionicons 
                    name={hasRequest ? "time" : "add-circle"} 
                    size={16} 
                    color="#ffffff" 
                  />
                  <Text style={styles.joinButtonText}>
                    {hasRequest ? 'Request Sent' : 'Join Team'}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </GlassCard>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
        <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
          <ScreenHeader title="Join Team" showBackButton />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22d3ee" />
            <Text style={styles.loadingText}>Loading teams...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
        <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
          <ScreenHeader title="Join Team" showBackButton />
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Failed to load teams</Text>
            <Text style={styles.errorText}>{error}</Text>
            <CyberButton title="Retry" onPress={loadTeams} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
        
        <ScreenHeader title="Join Team" showBackButton />

        <View style={styles.content}>
          {/* Search Section */}
          <Animated.View 
            style={[
              styles.searchSection,
              { 
                opacity: searchAnim, 
                transform: [{ translateY: Animated.multiply(searchAnim, -20) }] 
              }
            ]}
          >
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Teams List */}
          <FlatList
            data={filteredTeams}
            renderItem={renderTeamCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.teamsContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#64748b" />
                <Text style={styles.emptyStateTitle}>No teams found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search or category filters
                </Text>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    minHeight: height,
    minWidth: width,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
  },
  
  // Search section
  searchSection: {
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    marginRight: 8,
    paddingVertical: 0,
  },
  
  // Categories
  categoriesSection: {
    paddingTop: 4,
  },
  categoriesContainer: {
    paddingRight: 20,
    paddingLeft: 4,
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: 'rgba(34, 211, 238, 0.25)',
    borderColor: '#22d3ee',
    borderWidth: 1.5,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedChipText: {
    color: '#22d3ee',
    fontWeight: '700',
  },
  
  // Teams list
  teamsContainer: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  cardContainer: {
    marginBottom: 16,
  },
  teamCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  
  // Team header
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teamLogoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  teamBadge: {
    marginLeft: 8,
  },
  badgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Description
  teamDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  // Skills
  skillsContainer: {
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techTag: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#22d3ee',
    fontWeight: '500',
  },
  moreTagText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Join button
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pendingButton: {
    opacity: 0.7,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default JoinTeamScreen;
