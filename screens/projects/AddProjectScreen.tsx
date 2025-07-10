import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const AddProjectScreen: React.FC = () => {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    team: '',
    dueDate: '',
    priority: 'medium',
    tags: '',
    budget: '',
  });

  const priorities = ['low', 'medium', 'high'];

  const renderFloatingOrbs = () => (
    <>
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
    </>
  );

  const updateField = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#9CA3AF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderFloatingOrbs()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#22d3ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Project</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Project Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter project title..."
              placeholderTextColor="#9CA3AF"
              value={projectData.title}
              onChangeText={(value) => updateField('title', value)}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your project..."
              placeholderTextColor="#9CA3AF"
              value={projectData.description}
              onChangeText={(value) => updateField('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Team */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Team</Text>
            <TextInput
              style={styles.input}
              placeholder="Select or enter team name..."
              placeholderTextColor="#9CA3AF"
              value={projectData.team}
              onChangeText={(value) => updateField('team', value)}
            />
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity style={styles.dateInput}>
              <Text style={projectData.dueDate ? styles.dateText : styles.datePlaceholder}>
                {projectData.dueDate || 'Select due date'}
              </Text>
              <Ionicons name="calendar" size={20} color="#22d3ee" />
            </TouchableOpacity>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    projectData.priority === priority && {
                      backgroundColor: getPriorityColor(priority) + '40',
                      borderColor: getPriorityColor(priority),
                    }
                  ]}
                  onPress={() => updateField('priority', priority)}
                >
                  <Text style={[
                    styles.priorityText,
                    projectData.priority === priority && {
                      color: getPriorityColor(priority)
                    }
                  ]}>
                    {priority.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tags separated by commas..."
              placeholderTextColor="#9CA3AF"
              value={projectData.tags}
              onChangeText={(value) => updateField('tags', value)}
            />
          </View>

          {/* Budget */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter budget amount..."
              placeholderTextColor="#9CA3AF"
              value={projectData.budget}
              onChangeText={(value) => updateField('budget', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Create Project</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: 'rgba(0, 216, 255, 0.1)',
  },
  orb1: {
    width: 150,
    height: 150,
    top: 100,
    right: -50,
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 200,
    left: -80,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    gap: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  datePlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  priorityText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: 'rgba(34, 211, 238, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddProjectScreen;
