import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CyberButton from '../../components/ui/CyberButton';
import GlassCard from '../../components/ui/GlassCard';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Colors } from '../../constants/Colors';

const CreateTeamScreen: React.FC = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    maxMembers: '10',
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Web3 Development',
    'DeFi Protocol',
    'NFT Project',
    'Gaming',
    'Infrastructure',
    'Security Audit',
    'Research',
    'Other'
  ];

  const handleCreateTeam = async () => {
    if (!formData.name || !formData.description) {
      Alert.alert('Error', 'Please fill in team name and description');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Team created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }, 2000);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <ScreenHeader title="Create Team" showBackButton />
        
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GlassCard style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Team Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter team name"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description *</Text>
                <View style={styles.textAreaWrapper}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your team's mission and goals..."
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {categories.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.categoryChip,
                          formData.category === category && styles.categoryChipSelected
                        ]}
                        onPress={() => handleInputChange('category', category)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            formData.category === category && styles.categoryTextSelected
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Max Members</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-add-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.maxMembers}
                    onChangeText={(text) => handleInputChange('maxMembers', text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={styles.switchRow}
                  onPress={() => handleInputChange('isPrivate', (!formData.isPrivate).toString())}
                >
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchTitle}>Private Team</Text>
                    <Text style={styles.switchDescription}>
                      Require approval to join
                    </Text>
                  </View>
                  <View style={[styles.switch, formData.isPrivate && styles.switchActive]}>
                    <View style={[styles.switchThumb, formData.isPrivate && styles.switchThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              <CyberButton
                title="Create Team"
                onPress={handleCreateTeam}
                loading={isLoading}
                style={styles.createButton}
              />
            </GlassCard>

            <GlassCard style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Team Creation Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Choose a clear, memorable team name</Text>
                <Text style={styles.tipItem}>• Write a compelling description of your goals</Text>
                <Text style={styles.tipItem}>• Select the most relevant category</Text>
                <Text style={styles.tipItem}>• Consider starting with a smaller team size</Text>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  textAreaWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: Colors.primary,
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: Colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  createButton: {
    marginTop: 8,
  },
  tipsCard: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default CreateTeamScreen;
