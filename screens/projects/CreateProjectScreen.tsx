import { projectService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import SimpleMultiSelect from '../../components/ui/SimpleMultiSelect';
import { useMultiSelect } from '../../hooks/useMultiSelect';
import { filterService } from '../../services/filters';

const CreateProjectScreen: React.FC = () => {

  // State
  const [projectData, setProjectData] = useState({
    projectName: '',
    projectDescription: '',
    gitHubLink: '',
    liveLink: '',
  });

  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Multi-select hooks
  const techStackFilter = useMultiSelect({
    maxSelections: 10,
    onCreateApi: async (label) => {
      const newItem = await filterService.createTechStack(label);
      return {
        id: newItem.id,
        label: newItem.content
      };
    },
  });

  const languageFilter = useMultiSelect({
    maxSelections: 5,
    onCreateApi: async (label) => {
      const newItem = await filterService.createLanguage(label);
      return {
        id: newItem.id,
        label: newItem.content
      };
    },
  });

  const tagFilter = useMultiSelect({
    maxSelections: 10,
    onCreateApi: async (label) => {
      const newItem = await filterService.createTag(label);
      return {
        id: newItem.id,
        label: newItem.content
      };
    },
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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

  // Update field
  const updateField = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  // Image functions
  const pickThumbnail = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setThumbnailImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickProjectImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        const imageUris = result.assets.map(asset => asset.uri);
        setProjectImages(prev => [...prev, ...imageUris].slice(0, 5));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeProjectImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit function
  const handleSubmit = async () => {
    try {
      // Validation
      if (!projectData.projectName.trim()) {
        Alert.alert('Error', 'Project name is required');
        return;
      }
      if (!projectData.gitHubLink.trim()) {
        Alert.alert('Error', 'GitHub link is required');
        return;
      }
      if (!thumbnailImage) {
        Alert.alert('Error', 'Project thumbnail is required');
        return;
      }

      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create FormData
      const formData = new FormData();

      // Add text fields
      formData.append('projectName', projectData.projectName.trim());
      formData.append('projectDescription', projectData.projectDescription.trim());
      formData.append('gitHubLink', projectData.gitHubLink.trim());
      if (projectData.liveLink.trim()) {
        formData.append('liveLink', projectData.liveLink.trim());
      }

      // Add arrays as JSON strings (using IDs from selected options)
      formData.append('techStack', JSON.stringify(techStackFilter.value.map(item => item.id)));
      formData.append('language', JSON.stringify(languageFilter.value.map(item => item.id)));
      formData.append('tagId', JSON.stringify(tagFilter.value.map(item => item.id)));

      // Add thumbnail
      formData.append('projectThumbnail', {
        uri: thumbnailImage,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      } as any);

      // Add project images
      projectImages.forEach((image, index) => {
        formData.append('projectImage', {
          uri: image,
          type: 'image/jpeg',
          name: `project_${index}.jpg`,
        } as any);
      });

      await projectService.createProject(formData);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Project created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);

    } catch (error: any) {
      console.error('Create project error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  // Render functions
  const renderFloatingOrbs = () => (
    <>
      <Animated.View style={[styles.floatingOrb, styles.orb1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb2, { opacity: fadeAnim }]} />
    </>
  );

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline = false,
    keyboardType: any = 'default'
  ) => (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </Animated.View>
  );

  const renderImagePicker = () => (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <Text style={styles.inputLabel}>Project Images</Text>

      {/* Thumbnail */}
      <Text style={styles.subLabel}>Thumbnail *</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickThumbnail}>
        {thumbnailImage ? (
          <Image source={{ uri: thumbnailImage }} style={styles.thumbnailPreview} />
        ) : (
          <View style={styles.imagePickerPlaceholder}>
            <Ionicons name="camera" size={32} color="#22d3ee" />
            <Text style={styles.imagePickerText}>Add Thumbnail</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Project Images */}
      <Text style={styles.subLabel}>Project Images (Optional)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickProjectImages}>
        <View style={styles.imagePickerPlaceholder}>
          <Ionicons name="images" size={32} color="#22d3ee" />
          <Text style={styles.imagePickerText}>Add Project Images</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.imagePreviewContainer}>
        {projectImages.map((image, index) => (
          <View key={index} style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeProjectImage(index)}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {renderFloatingOrbs()}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#22d3ee" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>CREATE PROJECT</Text>
              <Text style={styles.subtitle}>Build something amazing</Text>
            </View>
          </Animated.View>

          {/* Form */}
          {renderInputField(
            'Project Name *',
            projectData.projectName,
            (text) => updateField('projectName', text),
            'Enter project name'
          )}

          {renderInputField(
            'Description',
            projectData.projectDescription,
            (text) => updateField('projectDescription', text),
            'Describe your project',
            true
          )}

          {renderInputField(
            'GitHub Link *',
            projectData.gitHubLink,
            (text) => updateField('gitHubLink', text),
            'https://github.com/username/repo',
            false,
            'url'
          )}

          {renderInputField(
            'Live Demo Link',
            projectData.liveLink,
            (text) => updateField('liveLink', text),
            'https://yourproject.com',
            false,
            'url'
          )}

          {/* Tech Stack Selection */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <SimpleMultiSelect
              label="Tech Stack"
              value={techStackFilter.value}
              onChange={techStackFilter.setValue}
              placeholder="Select technologies (e.g., React, Node.js)"
              allowCreate={true}
              onCreate={techStackFilter.props.onCreate}
              onSearch={async (query) => {
                const results = await filterService.getTechStacks(query);
                return results.map(item => ({
                  id: item.id,
                  label: item.content
                }));
              }}
              maxSelections={10}
              loading={techStackFilter.creating}
              style={styles.multiSelectStyle}
            />
          </Animated.View>

          {/* Languages Selection */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <SimpleMultiSelect
              label="Programming Languages"
              value={languageFilter.value}
              onChange={languageFilter.setValue}
              placeholder="Select languages (e.g., JavaScript, Python)"
              allowCreate={true}
              onCreate={languageFilter.props.onCreate}
              onSearch={async (query) => {
                const results = await filterService.getLanguages(query);
                return results.map(item => ({
                  id: item.id,
                  label: item.content
                }));
              }}
              maxSelections={5}
              loading={languageFilter.creating}
              style={styles.multiSelectStyle}
            />
          </Animated.View>

          {/* Tags Selection */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <SimpleMultiSelect
              label="Tags"
              value={tagFilter.value}
              onChange={tagFilter.setValue}
              placeholder="Add tags (e.g., Web App, Mobile)"
              allowCreate={true}
              onCreate={tagFilter.props.onCreate}
              onSearch={async (query) => {
                const results = await filterService.getTags(query);
                return results.map(item => ({
                  id: item.id,
                  label: item.content
                }));
              }}
              maxSelections={10}
              loading={tagFilter.creating}
              style={styles.multiSelectStyle}
            />
          </Animated.View>

          {renderImagePicker()}

          {/* Submit Button */}
          <Animated.View
            style={[
              styles.submitContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#6B7280', '#9CA3AF'] : ['#22d3ee', '#3b82f6']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <Text style={styles.submitText}>Creating...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.submitText}>Create Project</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#22d3ee',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 24,
    zIndex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22d3ee',
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  multiSelectStyle: {
    marginBottom: 12,
    zIndex: 99,
  },
  imagePicker: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  thumbnailPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateProjectScreen;
