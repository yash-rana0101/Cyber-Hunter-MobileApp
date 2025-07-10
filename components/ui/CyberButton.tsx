import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface CyberButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

const CyberButton: React.FC<CyberButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradient = false,
}) => {
  const buttonStyle = [
    styles.button,
    styles[size],
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const content = (
    <>
      {loading && <ActivityIndicator size="small" color="#000000" style={styles.loader} />}
      <Text style={textStyleCombined}>{title}</Text>
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled || loading}
        style={[buttonStyle, { padding: 0 }]}
      >
        <LinearGradient
          colors={[Colors.brand.accent, Colors.brand.primary, Colors.brand.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[size]]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  gradient: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.brand.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.brand.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: '800',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 18,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Text variants
  primaryText: {
    color: '#000000', // Black text for better readability on cyan background
  },
  secondaryText: {
    color: Colors.brand.secondary,
  },
  outlineText: {
    color: Colors.brand.primary,
  },
  ghostText: {
    color: Colors.text,
  },
  
  disabledText: {
    color: Colors.textSecondary,
  },
  
  loader: {
    marginRight: 8,
  },
});

export default CyberButton;
