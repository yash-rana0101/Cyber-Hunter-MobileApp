import { API_URL } from '@/constants/url';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  SlideInUp
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import CyberButton from '../../components/ui/CyberButton';
import { AuthContext } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const router = useRouter();
  const { signIn } = useContext(AuthContext);

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      if (response.data.data.requiresTwoFactor) {
        setShowTwoFactor(true);
        Toast.show({
          type: 'info',
          text1: 'Please enter your 2FA code',
        });
        return;
      }

      await signIn(response.data.data);
      router.replace('/(tabs)');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/v1/auth/login/verify-2fa`, {
        email,
        token: twoFactorCode,
      });

      await signIn(response.data.data);
      router.replace('/(tabs)');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Invalid 2FA code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSocialLoading('google');
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_URL}/api/v1/auth/google`,
        'cyberhunter://redirect'
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const response = await axios.get(`${API_URL}/api/v1/auth/google?code=${code}`);
        await signIn(response.data.data);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Google login failed',
        text2: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setSocialLoading('github');
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_URL}/api/v1/auth/github`,
        'cyberhunter://redirect'
      );

      if (result.type === 'success') {
        const response = await axios.get(`${API_URL}/api/v1/auth/github/callback${result.url.split('callback')[1]}`);
        await signIn(response.data.data);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      Toast.show({
        type: 'error',
        text1: 'GitHub login failed',
        text2: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleMetaMaskLogin = async () => {
    try {
      setSocialLoading('metamask');
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_URL}/api/v1/auth/wallet/connect`,
        'cyberhunter://redirect'
      );

      if (result.type === 'success') {
        const response = await axios.get(`${API_URL}/api/v1/auth/wallet/callback${result.url.split('callback')[1]}`);
        await signIn(response.data.data);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('MetaMask login error:', error);
      Toast.show({
        type: 'error',
        text1: 'MetaMask login failed',
        text2: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setSocialLoading(null);
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
      <Animated.View 
        entering={SlideInLeft.delay(1000).duration(2000)}
        style={[styles.floatingOrb, styles.orb3]} 
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#000000', '#0a0a0a', '#000000']}
          style={StyleSheet.absoluteFill}
        />
        
        {renderFloatingOrbs()}
        
        <ThemedView style={styles.content}>
          {/* Cyber Hunter Logo */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(1000)}
            style={styles.logoContainer}
          >
            <ThemedText style={styles.logoText}>CYBER HUNTER</ThemedText>
          </Animated.View>

          {/* Main Form Container */}
          <Animated.View 
            entering={SlideInUp.delay(400).duration(1000)}
            style={styles.formContainer}
          >
            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(34, 211, 238, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                style={styles.cardGradient}
              >
                {!showTwoFactor ? (
                  <>
                    <ThemedText style={styles.title}>Welcome Back</ThemedText>
                    <ThemedText style={styles.subtitle}>Sign in to continue your cybersecurity journey</ThemedText>
                    
                    {/* Input Fields */}
                    <View style={styles.inputContainer}>
                      <Animated.View entering={SlideInLeft.delay(600).duration(800)}>
                        <View style={styles.inputWrapper}>
                          <Ionicons name="mail-outline" size={20} color="#22d3ee" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#64748b"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                      </Animated.View>

                      <Animated.View entering={SlideInRight.delay(700).duration(800)}>
                        <View style={styles.inputWrapper}>
                          <Ionicons name="lock-closed-outline" size={20} color="#22d3ee" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#64748b"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                          />
                        </View>
                      </Animated.View>
                    </View>

                    {/* Login Button */}
                    <Animated.View entering={FadeInUp.delay(800).duration(800)}>
                      <CyberButton
                        onPress={handleEmailLogin}
                        disabled={loading}
                        loading={loading}
                        style={styles.loginButton}
                        title="Sign In"
                      />
                    </Animated.View>

                    {/* Divider */}
                    <Animated.View entering={FadeInUp.delay(900).duration(800)} style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <ThemedText style={styles.dividerText}>OR CONTINUE WITH</ThemedText>
                      <View style={styles.dividerLine} />
                    </Animated.View>

                    {/* Social Login Buttons */}
                    <Animated.View entering={FadeInUp.delay(1000).duration(800)} style={styles.socialContainer}>
                      <TouchableOpacity
                        style={[styles.socialButton, styles.googleButton]}
                        onPress={handleGoogleLogin}
                        disabled={socialLoading !== null}
                      >
                        {socialLoading === 'google' ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Ionicons name="logo-google" size={24} color="#fff" />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.socialButton, styles.githubButton]}
                        onPress={handleGithubLogin}
                        disabled={socialLoading !== null}
                      >
                        {socialLoading === 'github' ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Ionicons name="logo-github" size={24} color="#fff" />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.socialButton, styles.metamaskButton]}
                        onPress={handleMetaMaskLogin}
                        disabled={socialLoading !== null}
                      >
                        {socialLoading === 'metamask' ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Ionicons name="wallet-outline" size={24} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View entering={FadeInUp.delay(1100).duration(800)} style={styles.footer}>
                      <ThemedText style={styles.footerText}>Don&apos;t have an account? </ThemedText>
                      <TouchableOpacity onPress={() => router.replace('/auth/signup' as any)}>
                        <ThemedText style={styles.signupText}>Sign Up</ThemedText>
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.title}>Two-Factor Authentication</ThemedText>
                    <ThemedText style={styles.subtitle}>Enter the verification code from your authenticator app</ThemedText>
                    
                    <View style={styles.inputContainer}>
                      <Animated.View entering={SlideInUp.delay(300).duration(800)}>
                        <View style={styles.inputWrapper}>
                          <Ionicons name="shield-checkmark-outline" size={20} color="#22d3ee" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Enter 2FA Code"
                            placeholderTextColor="#64748b"
                            value={twoFactorCode}
                            onChangeText={setTwoFactorCode}
                            keyboardType="number-pad"
                            maxLength={6}
                          />
                        </View>
                      </Animated.View>
                    </View>

                    <Animated.View entering={FadeInUp.delay(500).duration(800)}>
                      <CyberButton
                        onPress={handleTwoFactorSubmit}
                        disabled={loading}
                        loading={loading}
                        style={styles.loginButton}
                        title="Verify & Sign In"
                      />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
                      <TouchableOpacity onPress={() => setShowTwoFactor(false)}>
                        <ThemedText style={styles.signupText}>← Back to Login</ThemedText>
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                )}
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  
  // Floating orbs for visual effect
  floatingOrb: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#22d3ee',
    top: 80,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#06b6d4',
    bottom: 180,
    left: -30,
  },
  orb3: {
    width: 120,
    height: 120,
    backgroundColor: '#0891b2',
    top: 250,
    left: width * 0.75,
  },

  // Logo section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 2,
    borderColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 32,
    color: '#22d3ee',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22d3ee',
    letterSpacing: 2,
    textShadowColor: 'rgba(34, 211, 238, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Form container
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
  },
  cardGradient: {
    padding: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  // Title and subtitle
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(34, 211, 238, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },

  // Input styles
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },

  // Button styles
  loginButton: {
    width: '100%',
    height: 56,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Social buttons
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  googleButton: {
    backgroundColor: 'rgba(219, 68, 55, 0.9)',
  },
  githubButton: {
    backgroundColor: 'rgba(51, 51, 51, 0.9)',
  },
  metamaskButton: {
    backgroundColor: 'rgba(246, 133, 27, 0.9)',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  signupText: {
    color: '#22d3ee',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Legacy styles (keeping for backward compatibility)
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  twoFactorContainer: {
    width: '100%',
  },
});
