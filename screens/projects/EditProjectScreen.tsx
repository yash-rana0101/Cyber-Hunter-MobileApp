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
import MultiSelectInput from '../../components/ui/MultiSelectInput';
import { FilterOption } from '../../services/filters';

interface ProjectData {
  projectName: string;
  projectDescription: string;
  gitHubLink: string;
  liveLink: string;
  techStack: FilterOption[];
  language: FilterOption[];
  tagId: FilterOption[];
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
            techStack: project.techStack.map((tech: any, index: number) => ({
              id: tech.id || index.toString(),
              content: tech.content || tech
            })),
            language: project.language.map((lang: any, index: number) => ({
              id: lang.id || index.toString(),
              content: lang.content || lang
            })),
            tagId: project.tagId.map((tag: any, index: number) => ({
              id: tag.id || index.toString(),
              content: tag.content || tag
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
      
      // Add arrays as JSON strings
      formData.append('techStack', JSON.stringify(projectData.techStack));
      formData.append('language', JSON.stringify(projectData.language));
      formData.append('tagId', JSON.stringify(projectData.tagId));

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
    selectedValues: FilterOption[],
    onSelectionChange: (selected: FilterOption[]) => void,
    placeholder: string
  ) => {
    // Common predefined options for each field
    const getOptionsForField = (fieldLabel: string): FilterOption[] => {
      switch (fieldLabel) {
        case 'Tech Stack':
          return [
            { id: '1', content: 'React' },
            { id: '2', content: 'Node.js' },
            { id: '3', content: 'Express' },
            { id: '4', content: 'MongoDB' },
            { id: '5', content: 'PostgreSQL' },
            { id: '6', content: 'TypeScript' },
            { id: '7', content: 'Next.js' },
            { id: '8', content: 'React Native' },
            { id: '9', content: 'Docker' },
            { id: '10', content: 'AWS' },
          ];
        case 'Languages':
          return [
            { id: '1', content: 'JavaScript' },
            { id: '2', content: 'TypeScript' },
            { id: '3', content: 'Python' },
            { id: '4', content: 'Java' },
            { id: '5', content: 'C++' },
            { id: '6', content: 'Swift' },
            { id: '7', content: 'Kotlin' },
            { id: '8', content: 'Go' },
            { id: '9', content: 'Rust' },
            { id: '10', content: 'PHP' },
          ];
        case 'Tags':
          return [
            { id: '1', content: 'Web App' },
            { id: '2', content: 'Mobile App' },
            { id: '3', content: 'API' },
            { id: '4', content: 'Full Stack' },
            { id: '5', content: 'Frontend' },
            { id: '6', content: 'Backend' },
            { id: '7', content: 'Machine Learning' },
            { id: '8', content: 'AI' },
            { id: '9', content: 'Game' },
            { id: '10', content: 'Tool' },
          ];
        default:
          return [];
      }
    };

    const handleCreateNew = async (inputValue: string): Promise<FilterOption> => {
      // Create a new option when user types something not in the list
      return {
        id: Date.now().toString(),
        content: inputValue,
      };
    };

    return (
      <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.inputLabel}>{label}</Text>
        <MultiSelectInput
          fieldName={label}
          placeholder={placeholder}
          options={getOptionsForField(label)}
          selectedValues={selectedValues}
          onSelectionChange={onSelectionChange}
          onCreateNew={handleCreateNew}
          searchable={true}
          creatable={true}
          maxSelections={10}
          containerStyle={styles.multiSelectContainer}
        />
      </Animated.View>
    );
  };

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
            projectData.techStack,
            (selected) => setProjectData(prev => ({ ...prev, techStack: selected })),
            'React, Node.js, etc.'
          )}

          {renderMultiSelectField(
            'Languages',
            projectData.language,
            (selected) => setProjectData(prev => ({ ...prev, language: selected })),
            'JavaScript, Python, etc.'
          )}

          {renderMultiSelectField(
            'Tags',
            projectData.tagId,
            (selected) => setProjectData(prev => ({ ...prev, tagId: selected })),
            'Web App, Mobile, etc.'
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
    overflow: 'visible',
  },
  keyboardAvoidingView: {
    flex: 1,
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
    overflow: 'visible',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    overflow: 'visible',
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
    zIndex: 999999,
    marginBottom: 8,
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
    zIndex: 999998,
    overflow: 'visible',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProjectScreen;
