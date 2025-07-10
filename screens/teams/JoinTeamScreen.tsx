import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { Colors } from '../../constants/Colors';
import { Team, useTeam } from '../../context/TeamContext';

// Frontend representation of a team
interface UITeam {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  tags: string[];
  rating: number;
  projects: number;
}

const JoinTeamScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { teams, isLoading, requestToJoinTeam, hasActiveJoinRequest } = useTeam();

  // Categories from backend (derived from team fields)
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loadingRequest, setLoadingRequest] = useState(false);
  
  // Convert backend teams to UI format
  const mapApiTeamsToUITeams = (apiTeams: Team[]): UITeam[] => {
    return apiTeams.map(team => ({
      id: team._id,
      name: team.TeamName,
      description: team.TeamDescription,
      category: team.techStack.length > 0 ? team.techStack[0] : 'Other',
      memberCount: team.TeamMembers?.length || 0,
      maxMembers: 5, // Hard-coded from backend logic
      isPrivate: team.joinRequests?.some(req => req.status === 'invited') || false,
      tags: [...team.techStack, ...team.interests].slice(0, 3), // Combine tech and interests for tags
      rating: 4.5, // Default rating (not available in API)
      projects: 0, // Projects count (will be updated)
    }));
  };

  // Transform teams from API to UI format
  const [uiTeams, setUITeams] = useState<UITeam[]>([]);
  
  // Load teams data when component mounts
  useEffect(() => {
    if (teams.length > 0) {
      // Convert API teams to UI format
      const mappedTeams = mapApiTeamsToUITeams(teams);
      setUITeams(mappedTeams);
      
      // Extract unique categories for filtering
      const uniqueCategories = ['All', ...new Set(teams.flatMap(team => team.techStack))];
      setCategories(uniqueCategories);
    }
  }, [teams]);

  const filteredTeams = uiTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (team.category && team.category === selectedCategory) || 
                            (team.tags && team.tags.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const handleJoinTeam = async (team: UITeam) => {

    // Check if there's already a pending join request
    if (hasActiveJoinRequest(team.id)) {
      Alert.alert('Request Pending', 'You already have a pending request to join this team.');
      return;
    }
    
    if (team.isPrivate) {
      Alert.alert(
        'Join Request',
        `Send a join request to ${team.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Request',
            onPress: async () => {
              setLoadingRequest(true);
              const success = await requestToJoinTeam(team.id);
              setLoadingRequest(false);
              
              if (success) {
                Alert.alert('Success', 'Join request sent! The team will review your application.', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Join Team',
        `Join ${team.name} immediately?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: async () => {
              setLoadingRequest(true);
              const success = await requestToJoinTeam(team.id);
              setLoadingRequest(false);
              
              if (success) {
                Alert.alert('Success', `Welcome to ${team.name}!`, [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              }
            },
          },
        ]
      );
    }
  };

  const renderTeamCard = ({ item: team }: { item: UITeam }) => (
    <GlassCard style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.teamMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.rating}>{team.rating}</Text>
            </View>
            <View style={styles.projectsContainer}>
              <Ionicons name="folder-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.projects}>{team.projects} projects</Text>
            </View>
          </View>
        </View>
        <View style={styles.teamBadge}>
          {team.isPrivate && (
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed" size={12} color={Colors.textSecondary} />
            </View>
          )}
        </View>
      </View>

      <Text style={styles.teamDescription}>{team.description}</Text>

      <View style={styles.tagsContainer}>
        {team.tags && team.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.teamFooter}>
        <View style={styles.membersInfo}>
          <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.membersText}>
            {team.memberCount}/{team.maxMembers} members
          </Text>
        </View>
        
        <CyberButton
          title={team.isPrivate ? 'Request' : 'Join'}
          onPress={() => handleJoinTeam(team)}
          size="small"
          variant={team.isPrivate ? 'outline' : 'primary'}
          disabled={loadingRequest}
        />
      </View>
    </GlassCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <ScreenHeader title="Join Team" showBackButton />
        
        <View style={styles.content}>
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <View style={styles.categoriesContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedCategory === item && styles.categoryChipSelected
                    ]}
                    onPress={() => setSelectedCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === item && styles.categoryTextSelected
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.categoriesList}
              />
            </View>
          </View>

          {/* Teams List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading teams...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTeams}
              keyExtractor={(item) => item.id}
              renderItem={renderTeamCard}
              contentContainerStyle={styles.teamsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>No teams found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                </View>
              }
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  categoriesContainer: {
    height: 50,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: Colors.primary,
  },
  teamsList: {
    paddingBottom: 20,
  },
  teamCard: {
    padding: 20,
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  projectsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projects: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teamBadge: {
    marginLeft: 12,
  },
  privateBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  teamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
});

export default JoinTeamScreen;
