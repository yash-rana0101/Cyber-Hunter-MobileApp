import { useMultiSelect } from '@/hooks/useMultiSelect';
import { projectService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  View,
} from 'react-native';
import SimpleMultiSelect, { SelectOption } from '../../components/ui/SimpleMultiSelect';
import { filterService } from '../../services/filters';

interface ProjectData {
  projectName: string;
  projectDescription: string;
  gitHubLink: string;
  liveLink: string;
  techStack: SelectOption[];
  language: SelectOption[];
  tagId: SelectOption[];
}

const EditProjectScreen: React.FC = () => {
  const { projectId } = useLocalSearchParams();
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: '',
    projectDescription: '',
    gitHubLink: '',
    liveLink: '',
    techStack: [],
    language: [],
    tagId: [],
  });

  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const initialValuesSet = useRef(false);

  // Multi-select hooks
  const techStackSelect = useMultiSelect({
    maxSelections: 10,
    onCreateApi: async (content: string) => {
      const result = await filterService.createTechStack(content);
      return { id: result.id, label: result.content };
    },
    onSearchApi: async (query: string) => {
      const result = await filterService.getTechStacks(query);
      return result;
    },
  });

  const languageSelect = useMultiSelect({
    maxSelections: 10,
    onCreateApi: async (content: string) => {
      const result = await filterService.createLanguage(content);
      return { id: result.id, label: result.content };
    },
    onSearchApi: async (query: string) => {
      const result = await filterService.getLanguages(query);
      return result;
    },
  });

  const tagSelect = useMultiSelect({
    maxSelections: 10,
    onCreateApi: async (content: string) => {
      const result = await filterService.createTag(content);
      return { id: result.id, label: result.content };
    },
    onSearchApi: async (query: string) => {
      const result = await filterService.getTags(query);
      return result;
    },
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const loadProject = async () => {
      try {
        setInitialLoading(true);
        const response = await projectService.getProjectById(projectId as string);

        if (response.project) {
          const project = response.project;
          setProjectData({
            projectName: project.projectName,
            projectDescription: project.projectDescription || '',
            gitHubLink: project.gitHubLink,
            liveLink: project.liveLink || '',
            // Transform arrays to match reference code pattern
            techStack: (project.techStack || []).map((tech: any) => ({
              id: tech.id || tech._id || tech.tagId || tech,
              label: tech.content || tech.name || tech
            })),
            language: (project.language || []).map((lang: any) => ({
              id: lang.id || lang._id || lang.tagId || lang,
              label: lang.content || lang.name || lang
            })),
            tagId: (project.tagId || []).map((tag: any) => ({
              id: tag.id || tag._id || tag.tagId || tag,
              label: tag.content || tag.name || tag
            })),
          });

          setThumbnailImage(project.projectThumbnail);
          setProjectImages(project.projectImage || []);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        Alert.alert('Error', 'Failed to load project details.');
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }

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
    ]).start();
  }, [projectId, fadeAnim, slideAnim]);

  // Separate effect to set initial values for multi-select hooks
  useEffect(() => {
    if (!initialValuesSet.current && (projectData.techStack.length > 0 || projectData.language.length > 0 || projectData.tagId.length > 0)) {
      techStackSelect.setValue(projectData.techStack);
      languageSelect.setValue(projectData.language);
      tagSelect.setValue(projectData.tagId);
      initialValuesSet.current = true;
    }
  }, [projectData.techStack, projectData.language, projectData.tagId, techStackSelect, languageSelect, tagSelect]);

  const updateField = (field: keyof ProjectData, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setThumbnailImage(result.assets[0].uri);
    }
  };

  const pickProjectImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setProjectImages(prev => [...prev, ...newImages].slice(0, 5)); // Limit to 5 images
    }
  };

  const removeProjectImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!projectData.projectName.trim()) {
      Alert.alert('Error', 'Project name is required');
      return false;
    }
    if (!projectData.gitHubLink.trim()) {
      Alert.alert('Error', 'GitHub link is required');
      return false;
    }
    if (!thumbnailImage) {
      Alert.alert('Error', 'Project thumbnail is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const formData = new FormData();

      // Add text fields
      formData.append('projectName', projectData.projectName);
      formData.append('projectDescription', projectData.projectDescription);
      formData.append('gitHubLink', projectData.gitHubLink);
      formData.append('liveLink', projectData.liveLink);

      // Add arrays as ID arrays - following reference code pattern
      // Extract IDs only for backend, similar to how reference code maps t.tagId, l.tagId
      const techStackIds = techStackSelect.value.map((item: SelectOption) => item.id);
      const languageIds = languageSelect.value.map((item: SelectOption) => item.id);
      const tagIds = tagSelect.value.map((item: SelectOption) => item.id);

      formData.append('techStack', JSON.stringify(techStackIds));
      formData.append('language', JSON.stringify(languageIds));
      formData.append('tagId', JSON.stringify(tagIds));

      // Add thumbnail only if it's changed (not the original URL)
      if (thumbnailImage && !thumbnailImage.startsWith('http')) {
        formData.append('projectThumbnail', {
          uri: thumbnailImage,
          type: 'image/jpeg',
          name: 'thumbnail.jpg',
        } as any);
      }

      // Add project images only if they're new (not original URLs)
      const newImages = projectImages.filter(image => !image.startsWith('http'));
      newImages.forEach((image, index) => {
        formData.append('projectImage', {
          uri: image,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      await projectService.updateProject(projectId as string, formData);

      Alert.alert(
        'Success',
        'Project updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
        />
      </View>
    </Animated.View>
  );

  const renderMultiSelectField = (
    label: string,
    multiSelectHook: any,
    placeholder: string,
    zIndex: number = 1000
  ) => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], zIndex }]}>
        <SimpleMultiSelect
          {...multiSelectHook.props}
          label={label}
          placeholder={placeholder}
          theme="dark"
          style={[styles.multiSelectContainer, { zIndex: zIndex + 1 }]}
        />
      </Animated.View>
    );
  };

  const renderImagePicker = () => (
    <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], zIndex: 1 }]}>
      <Text style={styles.inputLabel}>Project Images</Text>

      {/* Thumbnail */}
      <Text style={styles.subLabel}>Thumbnail (Required)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickThumbnail}>
        {thumbnailImage ? (
          <Image source={{ uri: thumbnailImage }} style={styles.thumbnailPreview} />
        ) : (
          <View style={styles.imagePickerPlaceholder}>
            <Ionicons name="camera" size={40} color="#22d3ee" />
            <Text style={styles.imagePickerText}>Update Thumbnail</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Project Images */}
      <Text style={styles.subLabel}>Project Images (Max 5)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickProjectImages}>
        <View style={styles.imagePickerPlaceholder}>
          <Ionicons name="images" size={40} color="#22d3ee" />
          <Text style={styles.imagePickerText}>Add More Images</Text>
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

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        {renderFloatingOrbs()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {renderFloatingOrbs()}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Project</Text>
            <View style={styles.placeholder} />
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

          {renderMultiSelectField(
            'Tech Stack',
            techStackSelect,
            'Search tech stack (e.g., React, Node.js)',
            1003
          )}

          {renderMultiSelectField(
            'Languages',
            languageSelect,
            'Search languages (e.g., JavaScript, Python)',
            1002
          )}

          {renderMultiSelectField(
            'Tags',
            tagSelect,
            'Search tags (e.g., Web App, Mobile)',
            1001
          )}

          {renderImagePicker()}

          {/* Submit Button */}
          <Animated.View style={[styles.submitContainer, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
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
                  <Text style={styles.submitText}>Updating...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.submitText}>Update Project</Text>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  multiSelectContainer: {
    marginBottom: 8,
    position: 'relative',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
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
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
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
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProjectScreen;
