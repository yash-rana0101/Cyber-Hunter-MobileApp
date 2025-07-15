import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useTeam } from '../../context/TeamContext';
import { projectService } from '../../services/api';

interface Project {
  _id: string;
  projectName: string;
  projectDescription: string;
  gitHubLink: string;
  liveLink?: string;
  projectThumbnail: string;
  projectImage: string[];
  techStack: string[];
  language: string[];
  rating: number;
  point: number;
  totalPoint: number;
  createdAt: string;
  updatedAt: string;
  teamId: string;
  userId: string;
}

const TeamProjectsScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userTeam } = useTeam();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const loadProjects = useCallback(async () => {
    if (!userTeam) return;
    
    try {
      setError(null);
      const response = await projectService.getTeamProjects(userTeam._id);
      if (response?.data) {
        setProjects(response.data);
      }
    } catch (err) {
      console.error('Error loading team projects:', err);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [userTeam]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }, [loadProjects]);

  const getStatusFromDate = (createdAt: string) => {
    const daysSinceCreation = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation < 30) return 'active';
    if (daysSinceCreation < 90) return 'completed';
    return 'on-hold';
  };

  const getPriorityFromPoints = (points: number) => {
    if (points >= 100) return 'high';
    if (points >= 50) return 'medium';
    return 'low';
  };

  const getProgressFromPoints = (points: number, totalPoints: number) => {
    return totalPoints > 0 ? Math.min(Math.round((points / totalPoints) * 100), 100) : 0;
  };

  const filters = [
    { key: 'all', label: 'All', count: projects.length },
    { key: 'active', label: 'Active', count: projects.filter(p => getStatusFromDate(p.createdAt) === 'active').length },
    { key: 'completed', label: 'Completed', count: projects.filter(p => getStatusFromDate(p.createdAt) === 'completed').length },
    { key: 'on-hold', label: 'On Hold', count: projects.filter(p => getStatusFromDate(p.createdAt) === 'on-hold').length },
  ];

  const filteredProjects = selectedFilter === 'all' 
    ? projects 
    : projects.filter(project => getStatusFromDate(project.createdAt) === selectedFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22d3ee';
      case 'completed': return '#10b981';
      case 'on-hold': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const renderFloatingOrbs = () => (
    <>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
      <View style={[styles.floatingOrb, styles.orb3]} />
    </>
  );

  const renderFilterChip = (filter: any) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterChip,
        selectedFilter === filter.key && styles.activeFilterChip
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilter === filter.key && styles.activeFilterChipText
      ]}>
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  );

  const renderProjectCard = (project: Project) => {
    const status = getStatusFromDate(project.createdAt);
    const priority = getPriorityFromPoints(project.point);
    const progress = getProgressFromPoints(project.point, project.totalPoint);
    const formattedDate = new Date(project.createdAt).toLocaleDateString();

    return (
      <Animated.View
        key={project._id}
        style={[
          styles.projectCard,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push(`/view-project?id=${project._id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.projectTitle}>{project.projectName}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(status)}20` }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(status) }
                ]}>
                  {status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.projectDescription}>{project.projectDescription || 'No description available'}</Text>
            
            <View style={styles.cardMetrics}>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Progress</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.projectMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={14} color="#64748b" />
                <Text style={styles.metaText}>Team Project</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={14} color="#64748b" />
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>
              
              <View style={[
                styles.priorityBadge,
                { backgroundColor: `${getPriorityColor(priority)}20` }
              ]}>
                <Text style={[
                  styles.priorityText,
                  { color: getPriorityColor(priority) }
                ]}>
                  {priority}
                </Text>
              </View>
            </View>
            
            <View style={styles.tagsContainer}>
              {project.techStack.slice(0, 3).map((tech: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tech}</Text>
                </View>
              ))}
              {project.techStack.length > 3 && (
                <View style={styles.moreTagsIndicator}>
                  <Text style={styles.moreTagsText}>+{project.techStack.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderFloatingOrbs()}
        <ScreenHeader 
          title="Team Projects"
          showBackButton={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderFloatingOrbs()}
        <ScreenHeader 
          title="Team Projects"
          showBackButton={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load projects</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProjects}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!userTeam) {
    return (
      <SafeAreaView style={styles.container}>
        {renderFloatingOrbs()}
        <ScreenHeader 
          title="Team Projects"
          showBackButton={true}
        />
        <View style={styles.emptyTeamContainer}>
          <Ionicons name="people-outline" size={48} color="#64748b" />
          <Text style={styles.emptyTeamTitle}>No team selected</Text>
          <Text style={styles.emptyTeamText}>Join a team to view projects</Text>
          <TouchableOpacity style={styles.joinTeamButton} onPress={() => router.push('/join-team')}>
            <Text style={styles.joinTeamButtonText}>Join Team</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      
      <ScreenHeader 
        title="Team Projects"
        showBackButton={true}
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/create-project')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {projects.filter(p => getStatusFromDate(p.createdAt) === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + getProgressFromPoints(p.point, p.totalPoint), 0) / projects.length) : 0}%
            </Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(renderFilterChip)}
        </ScrollView>

        {/* Projects List */}
        <View style={styles.projectsContainer}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map(renderProjectCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#64748b" />
              <Text style={styles.emptyStateTitle}>No projects found</Text>
              <Text style={styles.emptyStateDescription}>
                {selectedFilter === 'all' 
                  ? 'Your team hasn\'t created any projects yet.'
                  : `No ${selectedFilter} projects available.`
                }
              </Text>
              <TouchableOpacity style={styles.createProjectButton} onPress={() => router.push('/create-project')}>
                <Text style={styles.createProjectButtonText}>Create Project</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0a0a0a',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 120,
    height: 120,
    backgroundColor: '#22d3ee',
    top: '10%',
    right: -60,
  },
  orb2: {
    width: 80,
    height: 80,
    backgroundColor: '#a855f7',
    top: '60%',
    left: -40,
  },
  orb3: {
    width: 60,
    height: 60,
    backgroundColor: '#10b981',
    bottom: '20%',
    right: '20%',
  },
  scrollView: {
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22d3ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderColor: '#22d3ee',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#22d3ee',
  },
  projectsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  projectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  projectDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardMetrics: {
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    width: 60,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#22d3ee',
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
  cardFooter: {
    gap: 12,
  },
  projectMeta: {
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  moreTagsIndicator: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moreTagsText: {
    fontSize: 11,
    color: '#22d3ee',
    fontWeight: '600',
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
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Empty team styles
  emptyTeamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTeamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTeamText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  joinTeamButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinTeamButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Create project button
  createProjectButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  createProjectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TeamProjectsScreen;
