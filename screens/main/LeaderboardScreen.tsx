import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  FadeInLeft,
  FadeInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  ZoomIn
} from 'react-native-reanimated';
import MainScreenHeader from '../../components/ui/MainScreenHeader';
import MultiSelectInput from '../../components/ui/MultiSelectInput';
import {
  LeaderboardFilters,
  LeaderboardParams,
  LeaderboardResponse,
  leaderboardService,
  LeaderboardTeam,
  LeaderboardUser
} from '../../services/leaderboard';

const { width } = Dimensions.get('window');

const LeaderboardScreen: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [filters, setFilters] = useState<LeaderboardFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedType, setSelectedType] = useState<'individual' | 'team'>('individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState<{ id: string; content: string }[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<{ id: string; content: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ id: string; content: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);

  // Initialize animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, rotateAnim]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const params: LeaderboardParams = {
        type: selectedType,
        page: currentPage,
        limit: 20,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedTechStack.length > 0) {
        params.techStack = selectedTechStack.map(tech => tech.content).join(',');
      }
      if (selectedLanguages.length > 0) {
        params.language = selectedLanguages.map(lang => lang.content).join(',');
      }
      if (selectedTags.length > 0) {
        params.tag = selectedTags.map(tag => tag.content).join(',');
      }

      const [leaderboardRes, filtersRes] = await Promise.all([
        leaderboardService.getLeaderboard(params),
        filters ? Promise.resolve(filters) : leaderboardService.getFilters()
      ]);

      setLeaderboardData(leaderboardRes);
      if (!filters) {
        setFilters(filtersRes);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, searchQuery, selectedTechStack, selectedLanguages, selectedTags, currentPage, filters]);

  // Initial load
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchLeaderboard(false);
  }, [fetchLeaderboard]);

  // Filter handlers
  const handleTypeChange = (type: 'individual' | 'team') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  // Convert filter data to options format for MultiSelectInput
  const getTechStackOptions = () => {
    if (!filters) return [];
    return filters.techStacks.map((tech: string) => ({
      id: tech,
      content: tech
    }));
  };

  const getLanguageOptions = () => {
    if (!filters) return [];
    return filters.languages.map((lang: string) => ({
      id: lang,
      content: lang
    }));
  };

  const getTagOptions = () => {
    if (!filters) return [];
    return filters.tags.map((tag: string) => ({
      id: tag,
      content: tag
    }));
  };

  // Handler for multiselect changes
  const handleTechStackChange = (selected: { id: string; content: string }[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTechStack(selected);
    setCurrentPage(1);
  };

  const handleLanguagesChange = (selected: { id: string; content: string }[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguages(selected);
    setCurrentPage(1);
  };

  const handleTagsChange = (selected: { id: string; content: string }[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(selected);
    setCurrentPage(1);
  };

  const renderFloatingOrbs = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <>
        <Animated.View 
          style={[
            styles.floatingOrb, 
            styles.orb1,
            {
              transform: [{ rotate: spin }],
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingOrb, 
            styles.orb2,
            {
              transform: [{ rotate: spin }],
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingOrb, 
            styles.orb3,
            {
              transform: [{ rotate: spin }],
            }
          ]} 
        />
      </>
    );
  };

  const renderTypeToggle = () => (
    <Reanimated.View 
      entering={SlideInDown.delay(300).duration(800)}
      style={styles.typeToggleContainer}
    >
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'individual' && styles.activeToggleButton]}
          onPress={() => handleTypeChange('individual')}
        >
          <Text style={[styles.toggleButtonText, selectedType === 'individual' && styles.activeToggleText]}>
            Individual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'team' && styles.activeToggleButton]}
          onPress={() => handleTypeChange('team')}
        >
          <Text style={[styles.toggleButtonText, selectedType === 'team' && styles.activeToggleText]}>
            Teams
          </Text>
        </TouchableOpacity>
      </View>
    </Reanimated.View>
  );

  const renderSearchBar = () => (
    <Reanimated.View 
      entering={SlideInLeft.delay(400).duration(800)}
      style={styles.searchContainer}
    >
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${selectedType === 'individual' ? 'users' : 'teams'}...`}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </Reanimated.View>
  );

  const renderFilters = () => {
    if (!filters) return null;

    return (
      <Reanimated.View 
        entering={SlideInRight.delay(500).duration(800)}
        style={styles.filtersContainer}
      >
        <Text style={styles.filtersTitle}>Filters</Text>
        
        {/* Tech Stack Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Tech Stack</Text>
          <MultiSelectInput
            fieldName="Tech Stack"
            placeholder="Select tech stacks..."
            options={getTechStackOptions()}
            selectedValues={selectedTechStack}
            onSelectionChange={handleTechStackChange}
            maxSelections={5}
            containerStyle={styles.multiSelectContainer}
          />
        </View>

        {/* Language Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Programming Languages</Text>
          <MultiSelectInput
            fieldName="Language"
            placeholder="Select languages..."
            options={getLanguageOptions()}
            selectedValues={selectedLanguages}
            onSelectionChange={handleLanguagesChange}
            maxSelections={5}
            containerStyle={styles.multiSelectContainer}
          />
        </View>

        {/* Tag Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Tags</Text>
          <MultiSelectInput
            fieldName="Tag"
            placeholder="Select tags..."
            options={getTagOptions()}
            selectedValues={selectedTags}
            onSelectionChange={handleTagsChange}
            maxSelections={5}
            containerStyle={styles.multiSelectContainer}
          />
        </View>
      </Reanimated.View>
    );
  };

  const renderTopThreeCard = (user: LeaderboardUser | LeaderboardTeam, index: number) => {
    const isUser = 'email' in user;
    const crownColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const crownColor = crownColors[index] || '#9CA3AF';
    const userId = isUser ? (user as LeaderboardUser).userId : (user as LeaderboardTeam).teamId;

    return (
      <Reanimated.View 
        key={userId}
        entering={ZoomIn.delay(600 + index * 100).duration(800)}
        style={[styles.topThreeCard, index === 0 && styles.winnerCard]}
      >
        <View style={styles.crownContainer}>
          <Text style={[styles.crown, { color: crownColor }]}>👑</Text>
        </View>
        
        <View style={[styles.avatarContainer, { borderColor: crownColor }]}>
          {isUser && (user as LeaderboardUser).profilePicture ? (
            <Image source={{ uri: (user as LeaderboardUser).profilePicture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <Text style={styles.topThreeName} numberOfLines={1}>
          {user.name}
        </Text>
        
        <Text style={styles.topThreePoints}>
          {user.points.toLocaleString()}
        </Text>
        
        <View style={[styles.rankBadge, { backgroundColor: crownColor + '40' }]}>
          <Text style={styles.rankText}>#{user.rank}</Text>
        </View>
        
        {isUser && (
          <View style={styles.userMeta}>
            <Text style={styles.userMetaText}>{(user as LeaderboardUser).techStack}</Text>
            <Text style={styles.userMetaText}>{(user as LeaderboardUser).language}</Text>
          </View>
        )}
        
        {!isUser && (
          <View style={styles.teamMeta}>
            <Text style={styles.teamMetaText}>{(user as LeaderboardTeam).members} members</Text>
          </View>
        )}
      </Reanimated.View>
    );
  };

  const renderLeaderboardItem = (user: LeaderboardUser | LeaderboardTeam, index: number) => {
    const isUser = 'email' in user;
    const animationDelay = 700 + index * 50;
    const userId = isUser ? (user as LeaderboardUser).userId : (user as LeaderboardTeam).teamId;

    return (
      <Reanimated.View 
        key={userId}
        entering={FadeInUp.delay(animationDelay).duration(600)}
      >
        <TouchableOpacity style={styles.leaderboardItem}>
          <LinearGradient
            colors={[
              'rgba(31, 41, 55, 0.8)',
              'rgba(31, 41, 55, 0.6)',
              'rgba(31, 41, 55, 0.4)',
            ]}
            style={styles.leaderboardItemGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.rankContainer}>
              <Text style={styles.rankNumber}>#{user.rank}</Text>
            </View>
            
            <View style={styles.userAvatar}>
              {isUser && (user as LeaderboardUser).profilePicture ? (
                <Image source={{ uri: (user as LeaderboardUser).profilePicture }} style={styles.avatarImageSmall} />
              ) : (
                <Text style={styles.avatarEmoji}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userPoints}>
                {user.points.toLocaleString()} pts
              </Text>
              {isUser && (
                <Text style={styles.userTech} numberOfLines={1}>
                  {(user as LeaderboardUser).techStack} • {(user as LeaderboardUser).language}
                </Text>
              )}
              {!isUser && (
                <Text style={styles.teamInfo}>
                  {(user as LeaderboardTeam).members} members
                </Text>
              )}
            </View>
            
            <View style={styles.statusContainer}>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color="#9CA3AF" 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

  const renderStats = () => {
    if (!leaderboardData || leaderboardData.results.length === 0) return null;

    const stats = [
      { label: 'Total Entries', value: leaderboardData.pagination.totalCount.toString(), icon: 'people' },
      { label: 'Current Page', value: leaderboardData.pagination.page.toString(), icon: 'document' },
      { label: 'Top Score', value: leaderboardData.topThree[0]?.points.toLocaleString() || '0', icon: 'trophy' },
      { label: 'Competition', value: selectedType === 'individual' ? 'Individual' : 'Team', icon: 'flag' },
    ];

    return (
      <Reanimated.View 
        entering={FadeInLeft.delay(200).duration(800)}
        style={styles.statsContainer}
      >
        {stats.map((stat, index) => (
          <Reanimated.View 
            key={index}
            entering={SlideInUp.delay(300 + index * 100).duration(600)}
            style={styles.statCard}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name={stat.icon as any} size={20} color="#22d3ee" />
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </Reanimated.View>
        ))}
      </Reanimated.View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#22d3ee" />
      <Text style={styles.loadingText}>Loading leaderboard...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="warning" size={48} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchLeaderboard()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>No leaderboard data available</Text>
      <Text style={styles.emptySubText}>
        Be the first to earn points and climb the leaderboard!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#22d3ee']}
            tintColor="#22d3ee"
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <MainScreenHeader
            title="LEADERBOARD"
            subtitle="Top cyber hunters compete here"
            showProfileButton={true}
            showNotificationButton={true}
            notificationCount={3}
          />
        </Animated.View>

        {/* Type Toggle */}
        {renderTypeToggle()}

        {/* Search Bar */}
        {renderSearchBar()}

        {/* Filters */}
        {renderFilters()}

        {/* Content */}
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : !leaderboardData || leaderboardData.results.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Stats */}
            {renderStats()}

            {/* Top 3 Podium */}
            {leaderboardData.topThree.length > 0 && (
              <View style={styles.sectionContainer}>
                <Reanimated.Text 
                  entering={FadeInLeft.delay(600).duration(800)}
                  style={styles.sectionTitle}
                >
                  🏆 Hall of Fame
                </Reanimated.Text>
                <View style={styles.topThreeContainer}>
                  {leaderboardData.topThree.map(renderTopThreeCard)}
                </View>
              </View>
            )}

            {/* Full Leaderboard */}
            <View style={styles.sectionContainer}>
              <Reanimated.Text 
                entering={FadeInLeft.delay(800).duration(800)}
                style={styles.sectionTitle}
              >
                📊 Full Rankings
              </Reanimated.Text>
              <View style={styles.leaderboardContainer}>
                {leaderboardData.results.map(renderLeaderboardItem)}
              </View>
            </View>

            {/* Pagination Info */}
            {leaderboardData.pagination.totalPages > 1 && (
              <Reanimated.View 
                entering={FadeInUp.delay(1000).duration(800)}
                style={styles.paginationContainer}
              >
                <Text style={styles.paginationText}>
                  Page {leaderboardData.pagination.page} of {leaderboardData.pagination.totalPages}
                </Text>
                <Text style={styles.paginationSubText}>
                  Showing {leaderboardData.results.length} of {leaderboardData.pagination.totalCount} entries
                </Text>
              </Reanimated.View>
            )}
          </>
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
  headerContainer: {
    marginBottom: 20,
  },
  // Floating orbs
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
    top: 500,
    right: 20,
  },
  // Type toggle
  typeToggleContainer: {
    marginBottom: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 15,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#22d3ee',
  },
  toggleButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#0f0f23',
  },
  // Search bar
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  // Filters
  filtersContainer: {
    marginBottom: 20,
  },
  filtersTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  multiSelectContainer: {
    marginBottom: 8,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Sections
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  // Top three
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  topThreeCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    width: width * 0.28,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  winnerCard: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  crownContainer: {
    marginBottom: 10,
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
    marginBottom: 10,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatar: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  topThreeName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  topThreePoints: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rankBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userMeta: {
    alignItems: 'center',
  },
  userMetaText: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
  },
  teamMeta: {
    alignItems: 'center',
  },
  teamMetaText: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
  },
  // Leaderboard items
  leaderboardContainer: {
    marginBottom: 20,
  },
  leaderboardItem: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  leaderboardItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderRadius: 15,
  },
  rankContainer: {
    marginRight: 15,
  },
  rankNumber: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
  avatarImageSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarEmoji: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userPoints: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  userTech: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  teamInfo: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  statusContainer: {
    marginLeft: 10,
  },
  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  // Pagination
  paginationContainer: {
    alignItems: 'center',
    padding: 20,
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationSubText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 5,
  },
});

export default LeaderboardScreen;
