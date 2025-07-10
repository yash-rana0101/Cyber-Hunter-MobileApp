import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  members: number;
  deadline: string;
  tags: string[];
}

const TeamProjectsScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const mockProjects: Project[] = [
    {
      id: 1,
      title: 'Cyber Defense Platform',
      description: 'Next-gen security monitoring system',
      status: 'active',
      priority: 'high',
      progress: 75,
      members: 8,
      deadline: '2024-02-15',
      tags: ['Security', 'AI', 'React']
    },
    {
      id: 2,
      title: 'Mobile Authentication',
      description: 'Biometric auth integration',
      status: 'active',
      priority: 'medium',
      progress: 45,
      members: 5,
      deadline: '2024-03-01',
      tags: ['Mobile', 'Auth', 'iOS']
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      description: 'Real-time metrics visualization',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      members: 6,
      deadline: '2024-01-20',
      tags: ['Analytics', 'Dashboard', 'D3']
    },
    {
      id: 4,
      title: 'API Gateway Enhancement',
      description: 'Performance optimization project',
      status: 'on-hold',
      priority: 'low',
      progress: 30,
      members: 4,
      deadline: '2024-04-10',
      tags: ['Backend', 'API', 'Node.js']
    }
  ];

  const filters = [
    { key: 'all', label: 'All', count: mockProjects.length },
    { key: 'active', label: 'Active', count: mockProjects.filter(p => p.status === 'active').length },
    { key: 'completed', label: 'Completed', count: mockProjects.filter(p => p.status === 'completed').length },
    { key: 'on-hold', label: 'On Hold', count: mockProjects.filter(p => p.status === 'on-hold').length },
  ];

  const filteredProjects = selectedFilter === 'all' 
    ? mockProjects 
    : mockProjects.filter(project => project.status === selectedFilter);

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

  const renderProjectCard = (project: Project) => (
    <TouchableOpacity 
      key={project.id} 
      style={styles.projectCard}
      onPress={() => router.push(`/view-project?id=${project.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(project.status)}20` }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(project.status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(project.status) }
            ]}>
              {project.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.projectDescription}>{project.description}</Text>
        
        <View style={styles.cardMetrics}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${project.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{project.progress}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.projectMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={14} color="#64748b" />
            <Text style={styles.metaText}>{project.members} members</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color="#64748b" />
            <Text style={styles.metaText}>{project.deadline}</Text>
          </View>
          
          <View style={[
            styles.priorityBadge,
            { backgroundColor: `${getPriorityColor(project.priority)}20` }
          ]}>
            <Text style={[
              styles.priorityText,
              { color: getPriorityColor(project.priority) }
            ]}>
              {project.priority}
            </Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {project.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {project.tags.length > 3 && (
            <View style={styles.moreTagsIndicator}>
              <Text style={styles.moreTagsText}>+{project.tags.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockProjects.length}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockProjects.filter(p => p.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(mockProjects.reduce((acc, p) => acc + p.progress, 0) / mockProjects.length)}%
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
});

export default TeamProjectsScreen;
