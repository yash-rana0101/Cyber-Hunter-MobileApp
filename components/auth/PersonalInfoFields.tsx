import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import GlassCard from '../ui/GlassCard';

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  program: string;
  branch: string;
  session: string;
  section: string;
  qId: string;
  bio: string;
  profilePicture?: string;
}

interface PersonalInfoFieldsProps {
  userDetails: UserDetails;
  setUserDetails: (details: UserDetails) => void;
  genderOptions: string[];
  programOptions: string[];
  branchOptions: string[];
  sessionOptions: string[];
  sectionOptions: string[];
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  userDetails,
  setUserDetails,
  genderOptions,
  programOptions,
  branchOptions,
  sessionOptions,
  sectionOptions,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [modalField, setModalField] = React.useState<string>('');
  const [modalOptions, setModalOptions] = React.useState<string[]>([]);

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setUserDetails({ ...userDetails, [field]: value });
  };

  const openModal = (field: string, options: string[]) => {
    setModalField(field);
    setModalOptions(options);
    setShowModal(true);
  };

  const selectOption = (option: string) => {
    handleInputChange(modalField as keyof UserDetails, option);
    setShowModal(false);
  };

  const InputField: React.FC<{
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon: keyof typeof Ionicons.glyphMap;
    required?: boolean;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  }> = ({ label, placeholder, value, onChangeText, icon, required = false, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, multiline && styles.textAreaWrapper]}>
        <Ionicons name={icon} size={20} color={Colors.brand.primary} />
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );

  const SelectField: React.FC<{
    label: string;
    placeholder: string;
    value: string;
    options: string[];
    onSelect: (field: string, options: string[]) => void;
    field: string;
    required?: boolean;
  }> = ({ label, placeholder, value, options, onSelect, field, required = false }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={styles.selectWrapper}
        onPress={() => onSelect(field, options)}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <GlassCard style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.sectionSubtitle}>Tell us about yourself</Text>
      </View>

      <View style={styles.fieldsContainer}>
        <InputField
          label="Full Name"
          placeholder="Enter your full name"
          value={userDetails.name}
          onChangeText={(text) => handleInputChange('name', text)}
          icon="person-outline"
          required
        />

        <InputField
          label="Email"
          placeholder="Enter your email"
          value={userDetails.email}
          onChangeText={(text) => handleInputChange('email', text)}
          icon="mail-outline"
          keyboardType="email-address"
          required
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <InputField
              label="Phone"
              placeholder="Phone number"
              value={userDetails.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              icon="call-outline"
              keyboardType="phone-pad"
              required
            />
          </View>

          <View style={styles.halfWidth}>
            <InputField
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={userDetails.dateOfBirth}
              onChangeText={(text) => handleInputChange('dateOfBirth', text)}
              icon="calendar-outline"
              required
            />
          </View>
        </View>

        <SelectField
          label="Gender"
          placeholder="Select your gender"
          value={userDetails.gender}
          options={genderOptions}
          onSelect={openModal}
          field="gender"
          required
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <SelectField
              label="Program"
              placeholder="Select program"
              value={userDetails.program}
              options={programOptions}
              onSelect={openModal}
              field="program"
              required
            />
          </View>

          <View style={styles.halfWidth}>
            <SelectField
              label="Branch"
              placeholder="Select branch"
              value={userDetails.branch}
              options={branchOptions}
              onSelect={openModal}
              field="branch"
              required
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <SelectField
              label="Session"
              placeholder="Select session"
              value={userDetails.session}
              options={sessionOptions}
              onSelect={openModal}
              field="session"
              required
            />
          </View>

          <View style={styles.halfWidth}>
            <SelectField
              label="Section"
              placeholder="Select section"
              value={userDetails.section}
              options={sectionOptions}
              onSelect={openModal}
              field="section"
              required
            />
          </View>
        </View>

        <InputField
          label="Q-ID"
          placeholder="Enter your Q-ID"
          value={userDetails.qId}
          onChangeText={(text) => handleInputChange('qId', text)}
          icon="card-outline"
          required
        />

        <InputField
          label="About Yourself"
          placeholder="Tell us about yourself, your interests, and what you hope to achieve..."
          value={userDetails.bio}
          onChangeText={(text) => handleInputChange('bio', text)}
          icon="document-text-outline"
          multiline
          required
        />
      </View>

      {/* Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {modalField}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={modalOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => selectOption(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {userDetails[modalField as keyof UserDetails] === item && (
                    <Ionicons name="checkmark" size={20} color={Colors.brand.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </Animated.View>
        </View>
      </Modal>
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
  fieldsContainer: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  requiredStar: {
    color: Colors.brand.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    gap: 12,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    minHeight: 20,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  selectText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
});

export default PersonalInfoFields;
