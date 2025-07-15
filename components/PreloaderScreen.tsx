import React, { useEffect } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PreloaderScreenProps {
  onFinish: () => void;
}

const PreloaderScreen: React.FC<PreloaderScreenProps> = ({ onFinish }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Start the pulsing animation
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish, opacity]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(500)}
      style={styles.container}
    >
      {/* Background Orbs */}
      <View style={[styles.backgroundOrb, styles.orb1]} />
      <View style={[styles.backgroundOrb, styles.orb2]} />
      <View style={[styles.backgroundOrb, styles.orb3]} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo/GIF */}
        <Animated.View entering={FadeIn.delay(200).duration(800)}>
          <Image
            source={require('../assets/images/preloader.gif')}
            style={styles.preloaderGif}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Title */}
        <Animated.Text
          entering={FadeIn.delay(400).duration(800)}
          style={styles.appTitle}
        >
          Cyber Hunter
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeIn.delay(600).duration(800)}
          style={styles.subtitle}
        >
          Unleash Your Cyber Potential
        </Animated.Text>
      </View>

      {/* Bottom Text */}
      <Animated.View
        entering={FadeIn.delay(1000).duration(800)}
        style={styles.bottomContainer}
      >
        <Text style={styles.bottomText}>Secure • Innovative • Powerful</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundOrb: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  orb1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(0, 216, 255, 0.06)',
  },
  orb3: {
    width: 150,
    height: 150,
    top: height * 0.3,
    left: width * 0.7,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  preloaderGif: {
    width: 180,
    height: 180,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '400',
  },
  loadingIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  loadingBar: {
    width: 200,
    height: 3,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '70%',
    height: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
  },
});

export default PreloaderScreen;
