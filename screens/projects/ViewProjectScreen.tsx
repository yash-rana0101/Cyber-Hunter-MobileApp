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

const { width } = Dimensions.get('window');

const ViewProjectScreen: React.FC = () => {
  // Mock project data - in real app this would come from props or API
  const project = {
    id: 1,
    title: 'Network Security Audit',
    description: 'Comprehensive security assessment of corporate network infrastructure including vulnerability scanning, penetration testing, and security policy review.',
    status: 'active',
    progress: 75,
    team: 'Security Team Alpha',
    dueDate: '2025-07-20',
    startDate: '2025-06-01',
    priority: 'high',
    tags: ['Security', 'Network', 'Audit', 'Compliance'],
    budget: '$25,000',
    lead: 'Sarah Johnson',
    members: [
      { name: 'Alex Chen', role: 'Security Analyst', avatar: '👨‍💻' },
      { name: 'Maria Santos', role: 'Network Engineer', avatar: '👩‍💻' },
      { name: 'David Park', role: 'Compliance Officer', avatar: '👨‍⚡' },
    ],
    milestones: [
      { id: 1, title: 'Initial Assessment', completed: true, date: '2025-06-15' },
      { id: 2, title: 'Vulnerability Scanning', completed: true, date: '2025-06-30' },
      { id: 3, title: 'Penetration Testing', completed: false, date: '2025-07-15' },
      { id: 4, title: 'Final Report', completed: false, date: '2025-07-20' },
    ],
    recentActivity: [
      { id: 1, action: 'Vulnerability scan completed', user: 'Alex Chen', time: '2 hours ago' },
      { id: 2, action: 'New security issue identified', user: 'Maria Santos', time: '5 hours ago' },
      { id: 3, action: 'Milestone "Initial Assessment" completed', user: 'Sarah Johnson', time: '1 day ago' },
    ],
  };

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
    </>
  );

  const renderMilestone = (milestone: any) => (
    <View key={milestone.id} style={styles.milestoneItem}>
      <View style={[styles.milestoneIndicator, milestone.completed && styles.completedIndicator]}>
        {milestone.completed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
      </View>
      <View style={styles.milestoneContent}>
        <Text style={[styles.milestoneTitle, milestone.completed && styles.completedText]}>
          {milestone.title}
        </Text>
        <Text style={styles.milestoneDate}>{new Date(milestone.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const renderTeamMember = (member: any, index: number) => (
    <View key={index} style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{member.avatar}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>
    </View>
  );

  const renderActivityItem = (activity: any) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{activity.action}</Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityUser}>{activity.user}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="create" size={20} color="#22d3ee" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="share" size={20} color="#22d3ee" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Project Title */}
        <View style={styles.titleSection}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '40' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                {project.status.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(project.priority) + '40' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(project.priority) }]}>
                {project.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Project Progress</Text>
            <Text style={styles.progressPercentage}>{project.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>Due: {new Date(project.dueDate).toLocaleDateString()}</Text>
            <Text style={styles.progressText}>Started: {new Date(project.startDate).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{project.team}</Text>
            <Text style={styles.statLabel}>Team</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{project.budget}</Text>
            <Text style={styles.statLabel}>Budget</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{project.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{project.lead}</Text>
            <Text style={styles.statLabel}>Project Lead</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {project.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <View style={styles.milestonesContainer}>
            {project.milestones.map(renderMilestone)}
          </View>
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <View style={styles.teamContainer}>
            {project.members.map(renderTeamMember)}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {project.recentActivity.map(renderActivityItem)}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Edit Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Archive</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 34,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22d3ee',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22d3ee',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#22d3ee',
    fontWeight: '500',
  },
  milestonesContainer: {
    gap: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIndicator: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  teamContainer: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityContainer: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  activityUser: {
    fontSize: 12,
    color: '#22d3ee',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: 'rgba(34, 211, 238, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewProjectScreen;
