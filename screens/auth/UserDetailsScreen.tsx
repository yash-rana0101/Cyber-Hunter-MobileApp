import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CyberButton from '../../components/ui/CyberButton';
import GlassCard from '../../components/ui/GlassCard';
import { Colors } from '../../constants/Colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type UserDetailsScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'UserDetails'>;

const UserDetailsScreen: React.FC = () => {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveDetails = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill in your first and last name');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    }, 2000);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Tell us a bit more about yourself
            </Text>
          </View>

          {/* Form */}
          <GlassCard style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio (Optional)</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Skills (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="code-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., React, Solidity, Python"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.skills}
                  onChangeText={(text) => handleInputChange('skills', text)}
                />
              </View>
            </View>

            <CyberButton
              title="Complete Profile"
              onPress={handleSaveDetails}
              loading={isLoading}
              style={styles.saveButton}
            />

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
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
  },
  formCard: {
    padding: 24,
    flex: 1,
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
  textAreaWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default UserDetailsScreen;
