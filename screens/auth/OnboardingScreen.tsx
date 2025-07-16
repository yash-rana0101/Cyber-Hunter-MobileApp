import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import CyberButton from '../../components/ui/CyberButton';
import { Colors } from '../../constants/Colors';
import { AppDispatch } from '../../store';
import { setOnboardingCompleted } from '../../store/slices/authSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(featuresAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, titleAnim, slideAnim, featuresAnim, buttonAnim]);

  const handleGetStarted = async () => {
    try {
      await dispatch(setOnboardingCompleted());
      router.replace('/auth/signup' as any);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again',
      });
      console.error('Error during onboarding:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0a0a0a', '#000000']}
          style={styles.gradient}
        >
          {/* Cyber Grid Background */}
          <View style={styles.gridBackground}>
            {Array.from({ length: 8 }, (_, i) => (
              <View key={i} style={[styles.gridLine, { top: i * (screenHeight / 8) }]} />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <View key={i} style={[styles.gridLineVertical, { left: i * (screenWidth / 6) }]} />
            ))}
          </View>

          {/* Cyber accent lines */}
          <View style={styles.accentLines}>
            <View style={[styles.accentLine, styles.accentLineTop]} />
            <View style={[styles.accentLine, styles.accentLineBottom]} />
          </View>

          <SafeAreaView style={styles.safeArea}>
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo/Title Section */}
              <Animated.View 
                style={[
                  styles.logoSection,
                  {
                    opacity: titleAnim,
                  },
                ]}
              >
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>CYBER</Text>
                  <Text style={styles.logoSubtext}>HUNTER</Text>
                </View>
                <View style={styles.taglineContainer}>
                  <Text style={styles.tagline}>ENTER THE DIGITAL REALM</Text>
                  <View style={styles.taglineUnderline} />
                </View>
              </Animated.View>

              {/* Features Section */}
              <Animated.View 
                style={[
                  styles.featuresSection,
                  {
                    opacity: featuresAnim,
                  },
                ]}
              >
                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>◉</Text>
                  </View>
                  <Text style={styles.featureTitle}>PROJECT TRACKING</Text>
                  <Text style={styles.featureDesc}>Hunt and track blockchain projects in real-time</Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>⟐</Text>
                  </View>
                  <Text style={styles.featureTitle}>COMPETITIVE ARENA</Text>
                  <Text style={styles.featureDesc}>Rise through the ranks on global leaderboards</Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>⧫</Text>
                  </View>
                  <Text style={styles.featureTitle}>TACTICAL TEAMS</Text>
                  <Text style={styles.featureDesc}>Form alliances and dominate together</Text>
                </View>
              </Animated.View>

              {/* Action Section */}
              <Animated.View 
                style={[
                  styles.actionSection,
                  {
                    opacity: buttonAnim,
                  },
                ]}
              >
                <CyberButton
                  title="INITIALIZE HUNT"
                  onPress={handleGetStarted}
                  style={styles.initButton}
                />
                <Text style={styles.versionText}>v2.0.1 - ALPHA</Text>
              </Animated.View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.primary,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.primary,
  },
  accentLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  accentLineTop: {
    top: 60,
  },
  accentLineBottom: {
    bottom: 120,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 8,
    textAlign: 'center',
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  taglineUnderline: {
    width: 60,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  featuresSection: {
    flex: 1.5,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    alignItems: 'center',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  featureIconText: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSection: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  initButton: {
    marginBottom: 16,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    opacity: 0.6,
  },
});

export default OnboardingScreen;
