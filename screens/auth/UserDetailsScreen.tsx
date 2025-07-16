import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import InterestSection from '../../components/auth/InterestSection';
import PersonalInfoFields from '../../components/auth/PersonalInfoFields';
import ProfilePictureSection from '../../components/auth/ProfilePictureSection';
import TermsAndSubmit from '../../components/auth/TermsAndSubmit';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { AppDispatch, RootState } from '../../store';
import { updateUserProfile } from '../../store/slices/userSlice';

interface Interest {
  id: string;
  content: string;
}

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  program: string;
  branch: string;
  session: string;
  section: string;
  qId: string;
  bio: string;
  profilePicture?: string;
}

const UserDetailsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const userState = useSelector((state: RootState) => state.user);
  
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    program: '',
    branch: '',
    session: '',
    section: '',
    qId: '',
    bio: '',
    profilePicture: '',
  });
  
  const [interests, setInterests] = useState<Interest[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Available options for dropdowns
  const genderOptions = ['Male', 'Female', 'Other'];
  const programOptions = ['BTech', 'BCA', 'MCA', 'Other'];
  const branchOptions = ['CSE', 'CSCQ', 'AIML', 'FSD', 'DS', 'MAWT', 'CA', 'Other'];
  const sessionOptions = ['2022-25', '2022-26', '2023-26', '2023-27', '2024-28', '2024-27', '2025-29', '2025-28', '2026-29', '2026-30'];
  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'Other'];

  // Initialize animations
  const startAnimations = useCallback(() => {
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
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    startAnimations();
    
    // Check if user already completed profile
    if (user && userState.profile?.isProfileComplete) {
      router.replace('/(tabs)');
    }
  }, [startAnimations, user, userState.profile]);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to select your profile picture');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take your profile picture');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    if (!userDetails.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!userDetails.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!userDetails.dateOfBirth) {
      Alert.alert('Error', 'Please select your date of birth');
      return false;
    }
    if (!userDetails.gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    if (!userDetails.program) {
      Alert.alert('Error', 'Please select your program');
      return false;
    }
    if (!userDetails.branch) {
      Alert.alert('Error', 'Please select your branch');
      return false;
    }
    if (!userDetails.session) {
      Alert.alert('Error', 'Please select your session');
      return false;
    }
    if (!userDetails.section) {
      Alert.alert('Error', 'Please select your section');
      return false;
    }
    if (!userDetails.qId.trim()) {
      Alert.alert('Error', 'Please enter your Q-ID');
      return false;
    }
    if (!userDetails.bio.trim()) {
      Alert.alert('Error', 'Please write something about yourself');
      return false;
    }
    if (interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return false;
    }
    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const profileData = {
        ...userDetails,
        profilePicture: profileImage,
        interests: interests.map(interest => interest.id),
        isProfileComplete: true,
      };

      await dispatch(updateUserProfile(profileData)).unwrap();
      
      Alert.alert(
        'Success!',
        'Your profile has been created successfully. Welcome to Cyber Hunter!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refresh any data if needed
    setRefreshing(false);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.background, '#1a1a1a', Colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.brand.primary}
                colors={[Colors.brand.primary]}
              />
            }
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.title}>Complete Your Profile</Text>
                  <Text style={styles.subtitle}>
                    Join the <Text style={styles.brandText}>CYBER HUNTER</Text> community
                  </Text>
                </View>
              </View>

              {/* Profile Picture Section */}
              <ProfilePictureSection
                profileImage={profileImage}
                onImagePicker={handleImagePicker}
                onCameraCapture={handleCameraCapture}
              />

              {/* Personal Information */}
              <PersonalInfoFields
                userDetails={userDetails}
                setUserDetails={setUserDetails}
                genderOptions={genderOptions}
                programOptions={programOptions}
                branchOptions={branchOptions}
                sessionOptions={sessionOptions}
                sectionOptions={sectionOptions}
              />

              {/* Interests Section */}
              <InterestSection
                interests={interests}
                setInterests={setInterests}
              />

              {/* Terms and Submit */}
              <TermsAndSubmit
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
                isLoading={isLoading}
                onSubmit={handleSubmit}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  brandText: {
    color: Colors.brand.primary,
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen;
