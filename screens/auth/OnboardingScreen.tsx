import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
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

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.title}>CYBER HUNTER</Text>
            <Text style={styles.subtitle}>Welcome to the Future of Hunting</Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureTitle}>🎯 Track Projects</Text>
                <Text style={styles.featureDescription}>
                  Discover and track exciting blockchain projects
                </Text>
              </View>
              
              <View style={styles.feature}>
                <Text style={styles.featureTitle}>🏆 Compete & Win</Text>
                <Text style={styles.featureDescription}>
                  Join leaderboards and compete with other hunters
                </Text>
              </View>
              
              <View style={styles.feature}>
                <Text style={styles.featureTitle}>👥 Build Teams</Text>
                <Text style={styles.featureDescription}>
                  Collaborate with fellow hunters on projects
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionSection}>
            <CyberButton
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.getStartedButton}
            />
          </View>
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
    justifyContent: 'space-between',
    padding: 24,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 48,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 400,
  },
  feature: {
    marginBottom: 32,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    paddingBottom: 32,
  },
  getStartedButton: {
    marginTop: 16,
  },
});

export default OnboardingScreen;
