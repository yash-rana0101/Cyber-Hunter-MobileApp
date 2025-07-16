import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import GlassCard from '../ui/GlassCard';

interface Interest {
  id: string;
  content: string;
}

interface InterestSectionProps {
  interests: Interest[];
  setInterests: (interests: Interest[]) => void;
}

const InterestSection: React.FC<InterestSectionProps> = ({
  interests,
  setInterests,
}) => {
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for interests - replace with actual API call
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockInterests: Interest[] = [
          { id: '1', content: 'Cyber Security' },
          { id: '2', content: 'Web Development' },
          { id: '3', content: 'Mobile Development' },
          { id: '4', content: 'AI/ML' },
          { id: '5', content: 'Blockchain' },
          { id: '6', content: 'Cloud Computing' },
          { id: '7', content: 'Data Science' },
          { id: '8', content: 'DevOps' },
          { id: '9', content: 'UI/UX Design' },
          { id: '10', content: 'Game Development' },
          { id: '11', content: 'IoT' },
          { id: '12', content: 'Robotics' },
          { id: '13', content: 'Network Security' },
          { id: '14', content: 'Software Testing' },
          { id: '15', content: 'Database Management' },
        ];
        
        setAvailableInterests(mockInterests);
      } catch {
        setError('Failed to load interests');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const toggleInterest = (interest: Interest) => {
    const isSelected = interests.some(item => item.id === interest.id);
    
    if (isSelected) {
      setInterests(interests.filter(item => item.id !== interest.id));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const InterestChip: React.FC<{ interest: Interest }> = ({ interest }) => {
    const isSelected = interests.some(item => item.id === interest.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.interestChip,
          isSelected && styles.selectedChip,
        ]}
        onPress={() => toggleInterest(interest)}
      >
        <Text style={[
          styles.interestText,
          isSelected && styles.selectedText,
        ]}>
          {interest.content}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={16} color={Colors.brand.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <Text style={styles.sectionSubtitle}>
          Select your areas of interest (minimum 1 required)
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading interests...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.brand.primary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Retry logic here
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.selectedCount}>
            <Text style={styles.countText}>
              {interests.length} selected
            </Text>
          </View>

          <View style={styles.interestsGrid}>
            {availableInterests.map(interest => (
              <InterestChip key={interest.id} interest={interest} />
            ))}
          </View>
        </>
      )}
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
  selectedCount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: Colors.brand.primary,
    fontWeight: '500',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    gap: 6,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: Colors.brand.primary + '20',
    borderColor: Colors.brand.primary,
  },
  interestText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedText: {
    color: Colors.brand.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: Colors.text,
    fontWeight: '600',
  },
});

export default InterestSection;
