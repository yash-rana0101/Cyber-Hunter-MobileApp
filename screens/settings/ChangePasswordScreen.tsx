import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

const ChangePasswordScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: [
        ...(password.length < minLength ? ['At least 8 characters'] : []),
        ...(!hasUpperCase ? ['At least one uppercase letter'] : []),
        ...(!hasLowerCase ? ['At least one lowercase letter'] : []),
        ...(!hasNumbers ? ['At least one number'] : []),
        ...(!hasSpecialChar ? ['At least one special character'] : []),
      ],
    };
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Invalid Password', passwordValidation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      
      // First verify current password
      await api.post('/api/v1/auth/verify-password', {
        password: currentPassword,
      });

      // Then change password
      await api.post('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
      });

      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been updated successfully',
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Navigate back after success
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    showPassword: boolean,
    onToggleShow: () => void,
    showValidation?: boolean
  ) => {
    const validation = showValidation ? validatePassword(value) : null;
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={onToggleShow}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
        
        {showValidation && value && (
          <View style={styles.validationContainer}>
            {validation?.errors.map((error, index) => (
              <View key={index} style={styles.validationItem}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color="#EF4444"
                />
                <Text style={styles.validationText}>{error}</Text>
              </View>
            ))}
            {validation?.isValid && (
              <View style={styles.validationItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#10B981"
                />
                <Text style={[styles.validationText, { color: '#10B981' }]}>
                  Password is strong
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = newPassword && confirmPassword && newPassword !== confirmPassword;

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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Form */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(800)}
          style={styles.formContainer}
        >
          <Text style={styles.formTitle}>Update Your Password</Text>
          <Text style={styles.formSubtitle}>
            Choose a strong password to keep your account secure
          </Text>

          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            'Enter your current password',
            showCurrentPassword,
            () => setShowCurrentPassword(!showCurrentPassword)
          )}

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            'Enter your new password',
            showNewPassword,
            () => setShowNewPassword(!showNewPassword),
            true
          )}

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            'Confirm your new password',
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}

          {/* Password Match Indicator */}
          {confirmPassword && (
            <View style={styles.matchContainer}>
              <Ionicons
                name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={passwordsMatch ? '#10B981' : '#EF4444'}
              />
              <Text style={[
                styles.matchText,
                { color: passwordsMatch ? '#10B981' : '#EF4444' }
              ]}>
                {passwordsMatch ? 'Password matched' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          {/* Change Password Button */}
          <TouchableOpacity
            style={[
              styles.changeButton,
              (!currentPassword || !newPassword || !confirmPassword || passwordsDontMatch) && styles.disabledButton
            ]}
            onPress={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || !!passwordsDontMatch}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <>
                <Ionicons name="key" size={20} color="#000000" />
                <Text style={styles.changeButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Tips */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.tipsContainer}
          >
            <Text style={styles.tipsTitle}>Security Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={16} color="#22d3ee" />
                <Text style={styles.tipText}>Use a unique password for this account</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="eye-off" size={16} color="#22d3ee" />
                <Text style={styles.tipText}>Don&apos;t share your password with anyone</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="refresh" size={16} color="#22d3ee" />
                <Text style={styles.tipText}>Change your password regularly</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="lock-closed" size={16} color="#22d3ee" />
                <Text style={styles.tipText}>Enable two-factor authentication</Text>
              </View>
            </View>
          </Animated.View>
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
  headerRight: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  eyeButton: {
    padding: 16,
  },
  validationContainer: {
    marginTop: 12,
    gap: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 14,
    color: '#EF4444',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22d3ee',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
  },
  changeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 32,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
});

export default ChangePasswordScreen;
