import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import CyberButton from '../ui/CyberButton';
import GlassCard from '../ui/GlassCard';

interface TermsAndSubmitProps {
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

const TermsAndSubmit: React.FC<TermsAndSubmitProps> = ({
  termsAccepted,
  setTermsAccepted,
  isLoading,
  onSubmit,
}) => {
  const checkboxScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleCheckboxPress = () => {
    checkboxScale.value = withSpring(0.9, { duration: 150 }, () => {
      checkboxScale.value = withSpring(1, { duration: 150 });
    });
    setTermsAccepted(!termsAccepted);
  };

  const handleSubmitPress = () => {
    if (!termsAccepted) return;
    
    buttonScale.value = withSpring(0.95, { duration: 150 }, () => {
      buttonScale.value = withSpring(1, { duration: 150 });
    });
    onSubmit();
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.sectionSubtitle}>
          Please read and accept our terms to continue
        </Text>
      </View>

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleCheckboxPress}
        >
          <Animated.View style={[styles.checkbox, checkboxAnimatedStyle]}>
            {termsAccepted && (
              <Ionicons name="checkmark" size={16} color={Colors.brand.primary} />
            )}
          </Animated.View>
          <Text style={styles.termsText}>
            I accept the{' '}
            <Text style={styles.linkText}>Terms and Conditions</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.termsDetails}>
          <Text style={styles.termsDetailText}>
            By continuing, you agree to:
          </Text>
          <View style={styles.termsList}>
            <Text style={styles.termItem}>
              • Be part of Cyber Hunter club and its activities
            </Text>
            <Text style={styles.termItem}>
              • Follow community guidelines and code of conduct
            </Text>
            <Text style={styles.termItem}>
              • Participate in collaborative projects and learning
            </Text>
            <Text style={styles.termItem}>
              • Respect intellectual property and privacy
            </Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.submitContainer, buttonAnimatedStyle]}>
        <CyberButton
          title={isLoading ? "Creating Profile..." : "Complete Profile"}
          onPress={handleSubmitPress}
          disabled={!termsAccepted || isLoading}
          loading={isLoading}
          style={
            (!termsAccepted || isLoading) 
              ? { ...styles.submitButton, ...styles.disabledButton }
              : styles.submitButton
          }
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Welcome to the <Text style={styles.brandText}>Cyber Hunter</Text> community!
        </Text>
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
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.brand.primary,
    textDecorationLine: 'underline',
  },
  termsDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  termsDetailText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  termsList: {
    gap: 4,
  },
  termItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  submitContainer: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.brand.primary,
    minHeight: 56,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  brandText: {
    color: Colors.brand.primary,
    fontWeight: 'bold',
  },
});

export default TermsAndSubmit;
