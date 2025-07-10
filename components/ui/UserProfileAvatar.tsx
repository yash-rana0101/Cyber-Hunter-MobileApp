import { router } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

interface UserProfileAvatarProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showOnlineStatus?: boolean;
}

const UserProfileAvatar: React.FC<UserProfileAvatarProps> = ({
  size = 'medium',
  onPress,
  showOnlineStatus = true,
}) => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      const [currentUserResponse, userDetailResponse] = await Promise.all([
        api.get('/api/v1/user/me'),
        api.get(`/api/v1/user/${user._id}`),
      ]);

      const currentUserData = currentUserResponse.data.data;
      const userDetailData = userDetailResponse.data;

      setProfileData({
        name: userDetailData.name || currentUserData.name || '',
        profilePicture: userDetailData.profilePicture || currentUserData.profilePicture || '',
      });
    } catch (error) {
      console.error('Error fetching user profile for avatar:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/profile');
    }
  };

  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 60, height: 60, borderRadius: 30 };
      case 'medium':
      default:
        return { width: 44, height: 44, borderRadius: 22 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      case 'medium':
      default:
        return 16;
    }
  };

  const getInitials = () => {
    if (profileData.name) {
      return profileData.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '🔰';
  };

  const avatarSize = getAvatarSize();
  const textSize = getTextSize();

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={[styles.avatar, avatarSize]}>
        {!loading && profileData.profilePicture ? (
          <Image 
            source={{ uri: profileData.profilePicture }} 
            style={[styles.avatarImage, avatarSize]}
            defaultSource={require('../../assets/images/partial-react-logo.png')}
          />
        ) : (
          <Text style={[styles.avatarText, { fontSize: textSize }]}>
            {getInitials()}
          </Text>
        )}
      </View>
      
      {showOnlineStatus && (
        <View style={[styles.onlineIndicator, size === 'small' ? styles.smallIndicator : {}]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderWidth: 2,
    borderColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarImage: {
    borderRadius: 22, // This will be overridden by the dynamic style
  },
  avatarText: {
    color: '#22d3ee',
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#000000',
  },
  smallIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 1,
    right: 1,
  },
});

export default UserProfileAvatar;
