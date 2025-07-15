import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Project {
  _id: string;
  projectName: string;
  projectDescription: string;
  projectImage: string[];
  projectThumbnail: string;
  gitHubLink: string;
  liveLink?: string;
  techStack: { _id: string; content: string }[];
  language: { _id: string; content: string }[];
  tagId: { _id: string; content: string }[];
  status: 'pending' | 'active';
  rating: number;
  point: number;
  totalPoint: number;
  like: string[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  teamId?: string;
}

interface UserDetail {
  userId: string;
  interestId: { _id: string; content: string }[];
}

const ViewProjectScreen: React.FC = () => {
  const { user } = useAuth();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
  const [project, setProject] = useState<Project | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  // Start animations
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
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Fetch project data
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(projectId!);
      
      if (response.project) {
        setProject(response.project);
        setUserDetail(response.userDetail);
        setIsLiked(response.project.like?.includes(user?._id || '') || false);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('Error', 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!project) return;

    // Animate heart
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Update local state optimistically
    setIsLiked(!isLiked);
  };

  // Handle share
  const handleShare = async () => {
    if (!project) return;

    try {
      await Share.share({
        message: `Check out this amazing project: ${project.projectName}\\n\\n${project.projectDescription}\\n\\nGitHub: ${project.gitHubLink}`,
        title: project.projectName,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle external links
  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Project not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderFloatingOrbs = () => (
    <>
      <Animated.View style={[styles.floatingOrb, styles.orb1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb2, { opacity: fadeAnim }]} />
    </>
  );

  const renderImageGallery = () => {
    if (!project?.projectImage.length && !project?.projectThumbnail) return null;

    const images = project.projectThumbnail 
      ? [project.projectThumbnail, ...project.projectImage]
      : project.projectImage;

    return (
      <Animated.View 
        style={[
          styles.imageGallery,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.projectImage} />
          ))}
        </ScrollView>
        
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#22d3ee" />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#22d3ee" />
        </TouchableOpacity>
        
        <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
          <TouchableOpacity 
            style={[styles.headerButton, isLiked && styles.likedButton]} 
            onPress={handleLike}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#ef4444" : "#22d3ee"} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderProjectInfo = () => (
    <Animated.View 
      style={[
        styles.projectInfo,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <Text style={styles.projectTitle}>{project.projectName}</Text>
      <Text style={styles.projectDescription}>{project.projectDescription}</Text>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#ef4444" />
          <Text style={styles.statText}>{project.like?.length || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.statText}>{project.rating}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={16} color="#22d3ee" />
          <Text style={styles.statText}>{project.point}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statusBadge, project.status === 'active' && styles.activeBadge]}>
            <Text style={[styles.statusText, project.status === 'active' && styles.activeStatusText]}>
              {project.status}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderTags = () => {
    const allTags = [
      ...(project.techStack || []),
      ...(project.language || []),
      ...(project.tagId || []),
    ];

    if (allTags.length === 0) return null;

    return (
      <Animated.View 
        style={[
          styles.section,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Technologies & Tags</Text>
        <View style={styles.tagsContainer}>
          {allTags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag.content}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderLinks = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <Text style={styles.sectionTitle}>Project Links</Text>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkPress(project.gitHubLink)}
        >
          <LinearGradient
            colors={['#333333', '#1a1a1a']}
            style={styles.linkGradient}
          >
            <Ionicons name="logo-github" size={24} color="#FFFFFF" />
            <Text style={styles.linkText}>View on GitHub</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {project.liveLink && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleLinkPress(project.liveLink!)}
          >
            <LinearGradient
              colors={['#22d3ee', '#3b82f6']}
              style={styles.linkGradient}
            >
              <Ionicons name="open-outline" size={24} color="#FFFFFF" />
              <Text style={styles.linkText}>Live Demo</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {renderFloatingOrbs()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderImageGallery()}
        {renderHeader()}
        {renderProjectInfo()}
        {renderTags()}
        {renderLinks()}
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    bottom: 200,
    left: -75,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  imageGallery: {
    height: 250,
    marginBottom: 20,
  },
  projectImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    backgroundColor: '#22d3ee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  likedButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  projectInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  projectDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  activeStatusText: {
    color: '#22c55e',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '500',
  },
  linksContainer: {
    gap: 12,
  },
  linkButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewProjectScreen;
