import MainScreenHeader from '@/components/ui/MainScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Project {
  _id: string;
  projectName: string;
  projectDescription: string;
  projectThumbnail: string;
  projectImage: string[];
  gitHubLink: string;
  liveLink?: string;
  techStack: any[];
  language: any[];
  tagId: any[];
  rating: number;
  point: number;
  totalPoint: number;
  like: string[];
  status: 'pending' | 'active';
  createdAt: string;
  updatedAt: string;
  userId?: string;
  teamId?: string;
}

interface ProjectStats {
  total: number;
  active: number;
  pending: number;
  thisMonth: number;
}

const ProjectsScreenNew: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [stats, setStats] = useState<ProjectStats>({ total: 0, active: 0, pending: 0, thisMonth: 0 });
  
  const { user } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadProjects();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      const projectsData = Array.isArray(response) ? response : response.data || [];
      setProjects(projectsData);
      calculateStats(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData: Project[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const stats = {
      total: projectsData.length,
      active: projectsData.filter(p => p.status === 'active').length,
      pending: projectsData.filter(p => p.status === 'pending').length,
      thisMonth: projectsData.filter(p => {
        const projectDate = new Date(p.createdAt);
        return projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
      }).length,
    };
    
    setStats(stats);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleCreateProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-project');
  };

  const handleProjectPress = (project: Project) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/view-project',
      params: { projectId: project._id }
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectService.deleteProject(projectId);
              loadProjects();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          }
        }
      ]
    );
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.projectDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderFloatingOrbs = () => (
    <>
      <Animated.View style={[styles.floatingOrb, styles.orb1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb2, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb3, { opacity: fadeAnim }]} />
    </>
  );

  const renderHeader = () => (
    <MainScreenHeader
      title="My Projects"
      subtitle="Manage and track your progress"
      fadeAnim={fadeAnim}
      slideAnim={slideAnim}
    />
  );

  const renderStatsCard = (label: string, value: string, icon: string, color: string, index: number) => (
    <Animated.View
      key={label}
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.statIconContainer, { backgroundColor: `${color}30` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      {renderStatsCard('Total', stats.total.toString(), 'folder-outline', '#22d3ee', 0)}
      {renderStatsCard('Active', stats.active.toString(), 'checkmark-circle-outline', '#10b981', 1)}
      {renderStatsCard('Pending', stats.pending.toString(), 'time-outline', '#f59e0b', 2)}
      {renderStatsCard('This Month', stats.thisMonth.toString(), 'calendar-outline', '#8b5cf6', 3)}
    </View>
  );

  const renderSearchAndFilter = () => (
    <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </Animated.View>
  );

  const renderFilterTabs = () => (
    <Animated.View style={[styles.filterTabsContainer, { opacity: fadeAnim }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsContent}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'pending', label: 'Pending' }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              filterStatus === filter.key && styles.activeFilterTab
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterStatus(filter.key as any);
            }}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === filter.key && styles.activeFilterTabText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderProjectCard = (project: Project, index: number) => {
    return (
      <Animated.View
        key={project._id}
        style={[
          styles.projectCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [index * 10, 0],
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleProjectPress(project)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
            style={styles.projectCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.projectHeader}>
              <View style={styles.projectTitleContainer}>
                <Text style={styles.projectTitle}>{project.projectName}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: project.status === 'active' ? '#10b98130' : '#f59e0b30' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: project.status === 'active' ? '#10b981' : '#f59e0b' }
                  ]}>
                    {project.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.projectActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push({
                    pathname: '/edit-project',
                    params: { projectId: project._id }
                  })}
                >
                  <Ionicons name="pencil" size={16} color="#22d3ee" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteProject(project._id)}
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.projectDescription} numberOfLines={2}>
              {project.projectDescription}
            </Text>

            <View style={styles.projectMeta}>
              <View style={styles.projectStats}>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={14} color="#ef4444" />
                  <Text style={styles.statText}>{project.like.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.statText}>{project.rating}</Text>
                </View>
              </View>
            </View>

            <View style={styles.projectFooter}>
              <Text style={styles.dateText}>
                {new Date(project.createdAt).toLocaleDateString()}
              </Text>
              
              <View style={styles.projectLinks}>
                {project.gitHubLink && (
                  <TouchableOpacity style={styles.linkButton}>
                    <Ionicons name="logo-github" size={16} color="#22d3ee" />
                  </TouchableOpacity>
                )}
                {project.liveLink && (
                  <TouchableOpacity style={styles.linkButton}>
                    <Ionicons name="globe-outline" size={16} color="#22d3ee" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCreateButton = () => (
    <Animated.View style={[styles.createButtonContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateProject}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#22d3ee', '#3b82f6']}
          style={styles.createButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Project</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['rgba(34, 211, 238, 0.1)', 'rgba(59, 130, 246, 0.1)']}
        style={styles.emptyStateGradient}
      >
        <Ionicons name="folder-open-outline" size={64} color="#22d3ee" />
        <Text style={styles.emptyStateTitle}>No Projects Found</Text>
        <Text style={styles.emptyStateText}>
          {searchQuery ? 'Try adjusting your search criteria' : 'Create your first project to get started'}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        {renderFloatingOrbs()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {renderFloatingOrbs()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22d3ee"
            colors={['#22d3ee']}
          />
        }
      >
        {renderHeader()}
        {renderStats()}
        {renderSearchAndFilter()}
        {renderCreateButton()}
        {renderFilterTabs()}
        
        <View style={styles.projectsContainer}>
          {filteredProjects.length > 0 
            ? filteredProjects.map((project, index) => renderProjectCard(project, index))
            : renderEmptyState()
          }
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
  floatingOrb: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  orb1: {
    width: 200,
    height: 200,
    top: 100,
    right: -100,
  },
  orb2: {
    width: 150,
    height: 150,
    bottom: 300,
    left: -75,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  orb3: {
    width: 120,
    height: 120,
    top: 400,
    right: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    borderRadius: 25,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    height: 100,
  },
  statGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  createButtonContainer: {
    marginBottom: 16,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterTabsContainer: {
    marginBottom: 20,
  },
  filterTabsContent: {
    paddingRight: 16,
    gap: 8,
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
  filterTabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#22d3ee',
  },
  projectsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  projectCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  projectCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  techStackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  techBadge: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  techText: {
    fontSize: 10,
    color: '#22d3ee',
    fontWeight: '500',
  },
  moreTechText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  projectStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  projectLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  linkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  emptyStateTitle: {
    fontSize: 20,
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

export default ProjectsScreenNew;
