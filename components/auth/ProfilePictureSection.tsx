import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import GlassCard from '../ui/GlassCard';

interface ProfilePictureSectionProps {
  profileImage: string | null;
  onImagePicker: () => void;
  onCameraCapture: () => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  profileImage,
  onImagePicker,
  onCameraCapture,
}) => {
  const scaleAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      shadowOpacity: glowAnim.value,
    };
  });

  const handlePress = () => {
    scaleAnim.value = withSpring(0.95, { duration: 150 }, () => {
      scaleAnim.value = withSpring(1, { duration: 150 });
    });
    glowAnim.value = withTiming(1, { duration: 200 }, () => {
      glowAnim.value = withTiming(0, { duration: 300 });
    });
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <Text style={styles.sectionSubtitle}>Choose your profile picture</Text>
      </View>

      <View style={styles.imageContainer}>
        <Animated.View style={[styles.imageWrapper, animatedStyle]}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={40} color={Colors.textSecondary} />
            </View>
          )}
        </Animated.View>

        <View style={styles.uploadButtons}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              handlePress();
              onImagePicker();
            }}
          >
            <Ionicons name="image-outline" size={20} color={Colors.brand.primary} />
            <Text style={styles.uploadButtonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              handlePress();
              onCameraCapture();
            }}
          >
            <Ionicons name="camera-outline" size={20} color={Colors.brand.primary} />
            <Text style={styles.uploadButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.brand.primary,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: Colors.glass.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    color: Colors.brand.primary,
    fontWeight: '500',
  },
});

export default ProfilePictureSection;
