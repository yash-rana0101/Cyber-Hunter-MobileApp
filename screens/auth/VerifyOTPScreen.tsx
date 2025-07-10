import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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

type VerifyOTPScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyOTP'>;
type VerifyOTPScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyOTP'>;

const VerifyOTPScreen: React.FC = () => {
  const navigation = useNavigation<VerifyOTPScreenNavigationProp>();
  const route = useRoute<VerifyOTPScreenRouteProp>();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email } = route.params;

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Email verified successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    }, 2000);
  };

  const handleResendOTP = () => {
    Alert.alert('OTP Sent', 'A new verification code has been sent to your email');
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
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {email}
            </Text>
          </View>

          {/* Form */}
          <GlassCard style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor={Colors.textSecondary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
              />
            </View>

            <CyberButton
              title="Verify Code"
              onPress={handleVerifyOTP}
              loading={isLoading}
              style={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formCard: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  otpInput: {
    width: 200,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 24,
    color: Colors.text,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default VerifyOTPScreen;
