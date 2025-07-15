import { projectService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MultiSelectInput from '../../components/ui/MultiSelectInput';
import { filterService, FilterOption } from '../../services/filters';

interface ProjectData {
  projectName: string;
  projectDescription: string;
  gitHubLink: string;
  liveLink: string;
  techStack: FilterOption[];
  language: FilterOption[];
  tagId: FilterOption[];
}

const EditProjectScreenNew: React.FC = () => {
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

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<string>('');
  const [projectImages, setProjectImages] = useState<string[]>([]);
  
  // Options for MultiSelectInput
  const [techStackOptions, setTechStackOptions] = useState<FilterOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<FilterOption[]>([]);
  const [tagOptions, setTagOptions] = useState<FilterOption[]>([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load initial filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      const [techStacks, languages, tags] = await Promise.all([
        filterService.getTechStacks(),
        filterService.getLanguages(),
        filterService.getTags(),
      ]);
      
      setTechStackOptions(techStacks);
      setLanguageOptions(languages);
      setTagOptions(tags);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, []);

  // Convert API data to FilterOption format
  const convertToFilterOptions = (items: any[]): FilterOption[] => {
    return items.map(item => ({
      id: item._id || item.tagId || item.id,
      content: item.content || item.name || item
    }));
  };

  // Load project data
  const loadProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setInitialLoading(true);
      const projectResponse = await projectService.getProjectById(projectId as string);
      
      if (projectResponse.data) {
        const proj = projectResponse.data;
        
        // Convert existing project data to new format
        setProjectData({
          projectName: proj.projectName || '',
          projectDescription: proj.projectDescription || '',
          gitHubLink: proj.gitHubLink || '',
          liveLink: proj.liveLink || '',
          techStack: convertToFilterOptions(proj.techStack || []),
          language: convertToFilterOptions(proj.language || []),
          tagId: convertToFilterOptions(proj.tagId || []),
        });
        
        setThumbnailImage(proj.projectThumbnail || '');
        setProjectImages(proj.projectImage || []);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setInitialLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadFilterOptions();
    loadProject();
    
    // Start animations
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
  }, [loadFilterOptions, loadProject, fadeAnim, slideAnim]);

  // Form handlers
  const updateField = (field: keyof ProjectData, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechStackChange = (selected: FilterOption[]) => {
    setProjectData(prev => ({ ...prev, techStack: selected }));
  };

  const handleLanguageChange = (selected: FilterOption[]) => {
    setProjectData(prev => ({ ...prev, language: selected }));
  };

  const handleTagChange = (selected: FilterOption[]) => {
    setProjectData(prev => ({ ...prev, tagId: selected }));
  };

  // Create new options
  const handleCreateTechStack = async (content: string): Promise<FilterOption> => {
    try {
      const newOption = await filterService.createTechStack(content);
      setTechStackOptions(prev => [...prev, newOption]);
      return newOption;
    } catch (error) {
      console.error('Error creating tech stack:', error);
      throw error;
    }
  };

  const handleCreateLanguage = async (content: string): Promise<FilterOption> => {
    try {
      const newOption = await filterService.createLanguage(content);
      setLanguageOptions(prev => [...prev, newOption]);
      return newOption;
    } catch (error) {
      console.error('Error creating language:', error);
      throw error;
    }
  };

  const handleCreateTag = async (content: string): Promise<FilterOption> => {
    try {
      const newOption = await filterService.createTag(content);
      setTagOptions(prev => [...prev, newOption]);
      return newOption;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  // Image picker handlers
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
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setProjectImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeProjectImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
  };

  // Form validation
  const validateForm = (): boolean => {
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

  // Submit handler
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
      
      // Add arrays as JSON strings with IDs
      formData.append('techStack', JSON.stringify(projectData.techStack.map(item => item.id)));
      formData.append('language', JSON.stringify(projectData.language.map(item => item.id)));
      formData.append('tagId', JSON.stringify(projectData.tagId.map(item => item.id)));

      // Add thumbnail if changed
      if (thumbnailImage && !thumbnailImage.startsWith('http')) {
        formData.append('projectThumbnail', {
          uri: thumbnailImage,
          type: 'image/jpeg',
          name: 'thumbnail.jpg',
        } as any);
      }

      // Add project images if they're new
      projectImages.forEach((imageUri, index) => {
        if (!imageUri.startsWith('http')) {
          formData.append('projectImage', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `project_image_${index}.jpg`,
          } as any);
        }
      });

      await projectService.updateProject(projectId as string, formData);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Project updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating project:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render floating orbs
  const renderFloatingOrbs = () => (
    <>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
      <View style={[styles.floatingOrb, styles.orb3]} />
    </>
  );

  // Render input field
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

  // Render multiselect field
  const renderMultiSelectField = (
    label: string,
    fieldName: string,
    options: FilterOption[],
    selectedValues: FilterOption[],
    onSelectionChange: (selected: FilterOption[]) => void,
    onCreateNew?: (content: string) => Promise<FilterOption>,
    placeholder?: string
  ) => (
    <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <MultiSelectInput
        fieldName={fieldName}
        placeholder={placeholder || `Select ${fieldName.toLowerCase()}...`}
        options={options}
        selectedValues={selectedValues}
        onSelectionChange={onSelectionChange}
        onCreateNew={onCreateNew}
        maxSelections={10}
        searchable={true}
        creatable={!!onCreateNew}
        containerStyle={styles.multiSelectContainer}
      />
    </Animated.View>
  );

  // Render image picker
  const renderImagePicker = () => (
    <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.inputLabel}>Project Images</Text>
      
      {/* Thumbnail */}
      <Text style={styles.subLabel}>Thumbnail (Required)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickThumbnail}>
        {thumbnailImage ? (
          <Image source={{ uri: thumbnailImage }} style={styles.thumbnailPreview} />
        ) : (
          <View style={styles.imagePickerPlaceholder}>
            <Ionicons name="camera" size={40} color="#22d3ee" />
            <Text style={styles.imagePickerText}>Select Thumbnail</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Project Images */}
      <Text style={styles.subLabel}>Project Images (Max 5)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickProjectImages}>
        <View style={styles.imagePickerPlaceholder}>
          <Ionicons name="images" size={40} color="#22d3ee" />
          <Text style={styles.imagePickerText}>Add Project Images</Text>
        </View>
      </TouchableOpacity>

      {/* Image Preview */}
      {projectImages.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          {projectImages.map((imageUri, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeProjectImage(index)}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          'Tech Stack',
          techStackOptions,
          projectData.techStack,
          handleTechStackChange,
          handleCreateTechStack,
          'Select technologies used...'
        )}

        {renderMultiSelectField(
          'Programming Languages',
          'Language',
          languageOptions,
          projectData.language,
          handleLanguageChange,
          handleCreateLanguage,
          'Select programming languages...'
        )}

        {renderMultiSelectField(
          'Tags',
          'Tag',
          tagOptions,
          projectData.tagId,
          handleTagChange,
          handleCreateTag,
          'Add relevant tags...'
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
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitText}>Updating...</Text>
                </>
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
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 10,
  },
  // Floating orbs
  floatingOrb: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  orb1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  orb2: {
    width: 150,
    height: 150,
    bottom: 200,
    left: -75,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  orb3: {
    width: 120,
    height: 120,
    top: 300,
    left: -60,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
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
    marginBottom: 24,
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
  multiSelectContainer: {
    marginBottom: 8,
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

export default EditProjectScreenNew;
