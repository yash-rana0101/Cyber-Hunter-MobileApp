import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  glowEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  gradient = false, 
  glowEffect = false 
}) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={['rgba(0, 216, 255, 0.1)', 'rgba(0, 216, 255, 0.05)']}
        style={[styles.card, glowEffect && styles.glow, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, glowEffect && styles.glow, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: 16,
    overflow: 'hidden',
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default GlassCard;
