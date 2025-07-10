import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { signOut, user } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    title: '',
    qId: '',
    course: '',
    session: '',
    branch: '',
    section: '',
    phoneNumber: '',
    bio: '',
    profilePicture: '',
    DOB: '',
    gender: '',
    teamId: null,
    point: 0,
    rank: 0,
    techStack: [],
    language: [],
    projects: [],
  });

  const [editableData, setEditableData] = useState({
    name: '',
    bio: '',
    phoneNumber: '',
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile...');
      
      // Try to get current user first, then specific user data
      const [currentUserResponse, userResponse] = await Promise.all([
        api.get('/api/v1/user/me'),
        user?._id ? api.get(`/api/v1/user/${user._id}`) : Promise.resolve(null),
      ]);

      const currentUserData = currentUserResponse.data.data;
      const userDetailData = userResponse?.data || {};

      console.log('Current user data:', currentUserData);
      console.log('User detail data:', userDetailData);

      // Combine the data
      const combinedData = {
        name: userDetailData.name || currentUserData.name || '',
        email: currentUserData.email || '',
        title: 'Cyber Security Enthusiast', // Default title
        qId: userDetailData.qId || '',
        course: userDetailData.course || '',
        session: userDetailData.session || '',
        branch: userDetailData.branch || '',
        section: userDetailData.section || '',
        phoneNumber: userDetailData.phoneNumber || '',
        bio: userDetailData.description || userDetailData.bio || '',
        profilePicture: userDetailData.profilePicture || currentUserData.profilePicture || '',
        DOB: userDetailData.DOB || '',
        gender: userDetailData.gender || '',
        teamId: userDetailData.teamId || currentUserData.teamId || null,
        point: userDetailData.point || 0,
        rank: userDetailData.rank || 0,
        techStack: userDetailData.techStack || [],
        language: userDetailData.language || [],
        projects: userDetailData.projects || [],
      };

      setProfileData(combinedData);
      setEditableData({
        name: combinedData.name,
        bio: combinedData.bio,
        phoneNumber: combinedData.phoneNumber?.toString() || '',
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Loading Profile',
        text2: 'Failed to load profile data. Using default values.',
      });
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdateProfile = async () => {
    if (!user?._id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User ID not found',
      });
      return;
    }

    try {
      setUpdating(true);
      console.log('Updating profile with data:', editableData);

      await api.put(`/api/v1/user/${user._id}`, {
        name: editableData.name,
        bio: editableData.bio,
        phoneNumber: parseInt(editableData.phoneNumber) || undefined,
      });

      // Update local state
      setProfileData({
        ...profileData,
        name: editableData.name,
        bio: editableData.bio,
        phoneNumber: editableData.phoneNumber,
      });

      setIsEditing(false);
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update profile. Please try again.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableData({
      name: profileData.name,
      bio: profileData.bio,
      phoneNumber: profileData.phoneNumber?.toString() || '',
    });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? This will clear all your data and you will need to log in again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting sign out process...');
              
              // Add timeout to prevent hanging
              const signOutPromise = signOut();
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Sign out timeout')), 10000)
              );
              
              await Promise.race([signOutPromise, timeoutPromise]);
              console.log('Sign out completed successfully');
              
            } catch (error) {
              console.error('Error signing out:', error);
              
              // Force logout by navigating to login if timeout or error occurs
              Alert.alert(
                'Sign Out',
                'Signing out... You will be redirected to login.',
                [{ 
                  text: 'OK',
                  onPress: () => {
                    // Force navigation to login screen
                    router.replace('/auth/login' as any);
                  }
                }]
              );
            }
          },
        },
      ]
    );
  };

  const stats = [
    { 
      label: 'Projects Completed', 
      value: profileData.projects?.length?.toString() || '0', 
      icon: 'checkmark-circle' 
    },
    { 
      label: 'Current Rank', 
      value: profileData.rank > 0 ? `#${profileData.rank}` : 'N/A', 
      icon: 'trophy' 
    },
    { 
      label: 'Points Earned', 
      value: profileData.point?.toLocaleString() || '0', 
      icon: 'star' 
    },
    { 
      label: 'Tech Stack', 
      value: profileData.techStack?.length?.toString() || '0', 
      icon: 'code-slash' 
    },
  ];

  const renderFloatingOrbs = () => (
    <>
      <Animated.View 
        entering={FadeInUp.delay(500).duration(2000)}
        style={[styles.floatingOrb, styles.orb1]} 
      />
      <Animated.View 
        entering={FadeInDown.delay(800).duration(2000)}
        style={[styles.floatingOrb, styles.orb2]} 
      />
    </>
  );

  const renderStatCard = (stat: any, index: number) => (
    <Animated.View 
      key={index} 
      entering={SlideInLeft.delay(200 + index * 100).duration(800)}
      style={styles.statCard}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={stat.icon as any} size={20} color="#22d3ee" />
      </View>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
    </Animated.View>
  );

  const renderSkillTag = (skill: any, index: number) => (
    <Animated.View 
      key={index} 
      entering={SlideInRight.delay(300 + index * 50).duration(600)}
      style={styles.skillTag}
    >
      <Text style={styles.skillText}>
        {typeof skill === 'string' ? skill : skill.content || skill.name || 'Unknown'}
      </Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800)}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={[styles.editButton, { marginRight: 8 }]}
                  onPress={handleCancelEdit}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleUpdateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#22d3ee" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#22d3ee" />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create" size={20} color="#22d3ee" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Profile Avatar and Basic Info */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(1000)}
          style={styles.profileSection}
        >
          <View style={styles.avatarContainer}>
            {profileData.profilePicture ? (
              <Image source={{ uri: profileData.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profileData.name.charAt(0).toUpperCase() || '👨‍💻'}
                </Text>
              </View>
            )}
            <View style={styles.statusIndicator} />
          </View>
          
          <View style={styles.basicInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editableData.name}
                onChangeText={(text) => setEditableData({...editableData, name: text})}
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
              />
            ) : (
              <Text style={styles.name}>{profileData.name || 'Unknown User'}</Text>
            )}
            <Text style={styles.title}>{profileData.title}</Text>
            <Text style={styles.team}>
              {profileData.course && profileData.branch 
                ? `${profileData.course} - ${profileData.branch}` 
                : 'No Course Info'}
            </Text>
            {profileData.qId && (
              <Text style={styles.qId}>ID: {profileData.qId}</Text>
            )}
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => renderStatCard(stat, index))}
        </View>

        {/* Contact Information */}
        <Animated.View 
          entering={SlideInLeft.delay(600).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color="#22d3ee" />
              <Text style={styles.infoText}>{profileData.email || 'No email provided'}</Text>
            </View>
            {profileData.phoneNumber && (
              <View style={styles.infoItem}>
                <Ionicons name="call" size={20} color="#22d3ee" />
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editableData.phoneNumber}
                    onChangeText={(text) => setEditableData({...editableData, phoneNumber: text})}
                    placeholder="Enter phone number"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoText}>{profileData.phoneNumber}</Text>
                )}
              </View>
            )}
            {profileData.session && (
              <View style={styles.infoItem}>
                <Ionicons name="school" size={20} color="#22d3ee" />
                <Text style={styles.infoText}>Session: {profileData.session}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Bio Section */}
        <Animated.View 
          entering={SlideInRight.delay(700).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.bioCard}>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={editableData.bio}
                onChangeText={(text) => setEditableData({...editableData, bio: text})}
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#64748b"
              />
            ) : (
              <Text style={styles.bioText}>
                {profileData.bio || 'No bio provided. Add one to tell others about yourself!'}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Skills & Tech Stack */}
        <Animated.View 
          entering={FadeInUp.delay(800).duration(800)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Skills & Tech Stack</Text>
          <View style={styles.skillsContainer}>
            {[...profileData.techStack, ...profileData.language].length > 0 ? (
              [...profileData.techStack, ...profileData.language].map(renderSkillTag)
            ) : (
              <Text style={styles.noSkillsText}>No skills added yet</Text>
            )}
          </View>
        </Animated.View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={20} color="#22d3ee" />
                <Text style={styles.settingText}>Security Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color="#22d3ee" />
                <Text style={styles.settingText}>Notification Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="key" size={20} color="#22d3ee" />
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={styles.settingLeft}>
                <Ionicons name="log-out" size={20} color="#EF4444" />
                <Text style={[styles.settingText, { color: '#EF4444' }]}>Log Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 3,
    borderColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#000000',
  },
  basicInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#22d3ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#22d3ee',
    marginBottom: 4,
  },
  team: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  qId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#22d3ee',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  infoInput: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#22d3ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  bioCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  bioInput: {
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#22d3ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderWidth: 1,
    borderColor: '#22d3ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#22d3ee',
    fontWeight: '500',
  },
  noSkillsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  settingsContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
