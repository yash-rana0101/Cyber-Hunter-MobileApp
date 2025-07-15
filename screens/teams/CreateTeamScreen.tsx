import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
import { teamService } from '../../services/api';

const CreateTeamScreen: React.FC = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const [formData, setFormData] = useState({
    TeamName: '',
    TeamDescription: '',
    techStack: [] as string[],
    interests: [] as string[],
    TeamMembers: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<any>(null);

  const techStackOptions = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 
    'PostgreSQL', 'Docker', 'AWS', 'Blockchain', 'Solidity', 'Web3',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'C++',
    'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Cybersecurity'
  ];

  const interestOptions = [
    'Web Development', 'Mobile Development', 'Blockchain', 'AI/ML',
    'Data Science', 'Cybersecurity', 'Game Development', 'IoT',
    'Cloud Computing', 'DevOps', 'UI/UX Design', 'Product Management'
  ];

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

  const handleCreateTeam = async () => {
    if (!formData.TeamName || !formData.TeamDescription) {
      Alert.alert('Error', 'Please fill in team name and description');
      return;
    }

    setIsLoading(true);
    try {
      const teamFormData = new FormData();
      teamFormData.append('TeamName', formData.TeamName);
      teamFormData.append('TeamDescription', formData.TeamDescription);
      
      // Add tech stack
      formData.techStack.forEach((tech) => {
        teamFormData.append('techStack', tech);
      });
      
      // Add interests
      formData.interests.forEach((interest) => {
        teamFormData.append('interests', interest);
      });
      
      // Add team members if any
      formData.TeamMembers.forEach((member) => {
        teamFormData.append('TeamMembers', member);
      });

      // Add team logo if selected
      if (logoFile) {
        teamFormData.append('TeamLogo', {
          uri: logoFile.uri,
          type: logoFile.mimeType || 'image/jpeg',
          name: logoFile.fileName || 'team-logo.jpg',
        } as any);
      }

      const response = await teamService.createTeam(teamFormData);
      
      if (response.success) {
        Alert.alert('Success', 'Team created successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to create team');
      }
    } catch (error: any) {
      console.error('Create team error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechStackToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTeamLogo(result.assets[0].uri);
      setLogoFile(result.assets[0]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScreenHeader title="Create Team" showBackButton />
        
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GlassCard style={styles.formCard}>
              {/* Team Logo */}
              <View style={styles.logoContainer}>
                <TouchableOpacity style={styles.logoButton} onPress={pickImage}>
                  {teamLogo ? (
                    <Image source={{ uri: teamLogo }} style={styles.logoImage} />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Ionicons name="camera" size={24} color={Colors.textSecondary} />
                      <Text style={styles.logoText}>Add Logo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Team Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter team name"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.TeamName}
                    onChangeText={(text) => handleInputChange('TeamName', text)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your team's mission and goals..."
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.TeamDescription}
                    onChangeText={(text) => handleInputChange('TeamDescription', text)}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Tech Stack Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tech Stack</Text>
                <View style={styles.chipContainer}>
                  {techStackOptions.map((tech, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.chip,
                        formData.techStack.includes(tech) && styles.chipSelected
                      ]}
                      onPress={() => handleTechStackToggle(tech)}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.techStack.includes(tech) && styles.chipTextSelected
                      ]}>
                        {tech}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Interests Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Interests</Text>
                <View style={styles.chipContainer}>
                  {interestOptions.map((interest, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.chip,
                        formData.interests.includes(interest) && styles.chipSelected
                      ]}
                      onPress={() => handleInterestToggle(interest)}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.interests.includes(interest) && styles.chipTextSelected
                      ]}>
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <CyberButton
                title="Create Team"
                onPress={handleCreateTeam}
                loading={isLoading}
                style={styles.createButton}
              />
            </GlassCard>

            <GlassCard style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Team Creation Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Choose a clear, memorable team name</Text>
                <Text style={styles.tipItem}>• Write a compelling description of your goals</Text>
                <Text style={styles.tipItem}>• Select the most relevant category</Text>
                <Text style={styles.tipItem}>• Consider starting with a smaller team size</Text>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderColor: '#22d3ee',
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#22d3ee',
  },
  tipsCard: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default CreateTeamScreen;
