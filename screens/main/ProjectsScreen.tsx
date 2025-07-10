import UserProfileAvatar from '@/components/ui/UserProfileAvatar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'planning';
  progress: number;
  team: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

const ProjectsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const projectsData: Project[] = [
    {
      id: 1,
      title: 'Network Security Audit',
      description: 'Comprehensive security assessment of corporate network infrastructure',
      status: 'active',
      progress: 75,
      team: 'Security Team Alpha',
      dueDate: '2025-07-20',
      priority: 'high',
      tags: ['Security', 'Network', 'Audit'],
    },
    {
      id: 2,
      title: 'Vulnerability Scanner',
      description: 'Automated tool for detecting system vulnerabilities',
      status: 'completed',
      progress: 100,
      team: 'Dev Team Beta',
      dueDate: '2025-07-01',
      priority: 'medium',
      tags: ['Development', 'Security', 'Automation'],
    },
    {
      id: 3,
      title: 'Incident Response System',
      description: 'Real-time incident detection and response platform',
      status: 'active',
      progress: 45,
      team: 'Response Team Gamma',
      dueDate: '2025-08-15',
      priority: 'high',
      tags: ['Incident', 'Response', 'Platform'],
    },
    {
      id: 4,
      title: 'Encryption Protocol',
      description: 'Advanced encryption implementation for secure communications',
      status: 'planning',
      progress: 10,
      team: 'Crypto Team Delta',
      dueDate: '2025-09-01',
      priority: 'medium',
      tags: ['Encryption', 'Security', 'Protocol'],
    },
    {
      id: 5,
      title: 'Penetration Testing',
      description: 'Comprehensive penetration testing of web applications',
      status: 'paused',
      progress: 30,
      team: 'Pentest Team Epsilon',
      dueDate: '2025-08-30',
      priority: 'low',
      tags: ['Pentest', 'Web', 'Security'],
    },
  ];

  const stats = [
    { label: 'Total Projects', value: projectsData.length.toString(), icon: 'folder' },
    { label: 'Active', value: projectsData.filter(p => p.status === 'active').length.toString(), icon: 'play-circle' },
    { label: 'Completed', value: projectsData.filter(p => p.status === 'completed').length.toString(), icon: 'checkmark-circle' },
    { label: 'This Month', value: '3', icon: 'calendar' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#22d3ee';
      case 'paused': return '#F59E0B';
      case 'planning': return '#8B5CF6';
      default: return '#9CA3AF';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#9CA3AF';
    }
  };

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

  const renderProjectCard = (project: Project) => (
    <TouchableOpacity 
      key={project.id} 
      style={styles.projectCard}
      onPress={() => {
        // Navigate to ViewProjectScreen - you can pass project data as params
        router.push({
          pathname: '/view-project',
          params: { projectId: project.id.toString() }
        });
      }}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleContainer}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(project.priority) + '40' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(project.priority) }]}>
              {project.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.projectActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create" size={16} color="#22d3ee" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.projectDescription}>{project.description}</Text>

      <View style={styles.projectMeta}>
        <Text style={styles.teamText}>{project.team}</Text>
        <Text style={styles.dueDateText}>Due: {new Date(project.dueDate).toLocaleDateString()}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{project.progress}%</Text>
      </View>

      <View style={styles.projectFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '40' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
            {project.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.tagsContainer}>
          {project.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {project.tags.length > 2 && (
            <Text style={styles.moreTagsText}>+{project.tags.length - 2}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
            <Text style={styles.title}>PROJECTS</Text>
            <Text style={styles.subtitle}>Your cybersecurity projects</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => renderStatCard(stat, index))}
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#22d3ee" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => {
              router.push('/create-project');
            }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Project</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabsContainer}
          contentContainerStyle={styles.filterTabsContent}
        >
          {['all', 'active', 'completed', 'planning', 'paused'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                filterStatus === filter && styles.activeFilterTab
              ]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text style={[
                styles.filterTabText,
                filterStatus === filter && styles.activeFilterTabText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Projects List */}
        <View style={styles.projectsContainer}>
          {filteredProjects.map(renderProjectCard)}
        </View>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No projects found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first project to get started'}
            </Text>
          </View>
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
    marginBottom: 24,
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  filterButton: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: 'rgba(34, 211, 238, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderColor: '#22d3ee',
  },
  filterTabText: {
    color: '#9CA3AF',
    fontSize: 12,
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
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 20,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  teamText: {
    fontSize: 12,
    color: '#22d3ee',
    fontWeight: '500',
  },
  dueDateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 3,
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
    minWidth: 35,
    textAlign: 'right',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#9CA3AF',
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
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProjectsScreen;
