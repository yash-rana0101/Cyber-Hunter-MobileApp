import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useOverlay } from '../../context/OverlayProvider';

interface Option {
  id: string;
  content: string;
}

interface MultiSelectInputProps {
  fieldName?: string;
  placeholder?: string;
  options: Option[];
  selectedValues: Option[];
  onSelectionChange: (selected: Option[]) => void;
  onCreateNew?: (inputValue: string) => Promise<Option>;
  maxSelections?: number;
  searchable?: boolean;
  creatable?: boolean;
  loading?: boolean;
  containerStyle?: any;
  disabled?: boolean;
}

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  fieldName = 'Option',
  placeholder,
  options = [],
  selectedValues = [],
  onSelectionChange,
  onCreateNew,
  maxSelections,
  searchable = true,
  creatable = false,
  loading = false,
  containerStyle,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);
  const { showOverlay, hideOverlay } = useOverlay();
  
  // Animation values
  const selectedItemScale = useSharedValue(1);

  // Calculate filtered options on each render
  const filteredOptions = query.trim() 
    ? options.filter((option) =>
        option.content.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const handleCreateNew = useCallback(async () => {
    if (!onCreateNew || !query.trim() || creating) return;

    try {
      setCreating(true);
      const newOption = await onCreateNew(query.trim());
      
      if (newOption) {
        const updatedSelected = [...selectedValues, newOption];
        onSelectionChange(updatedSelected);
        setQuery('');
        setShowDropdown(false);
        hideOverlay();
      }
    } catch (error) {
      console.error('Error creating new option:', error);
    } finally {
      setCreating(false);
    }
  }, [onCreateNew, query, creating, selectedValues, onSelectionChange, hideOverlay]);

  const handleOptionSelect = useCallback((option: Option) => {
    const isSelected = selectedValues.some((selected) => selected.id === option.id);
    
    // Add scale animation
    selectedItemScale.value = withSpring(0.95, {}, () => {
      selectedItemScale.value = withSpring(1);
    });
    
    if (isSelected) {
      // Remove if already selected
      const updatedSelected = selectedValues.filter((selected) => selected.id !== option.id);
      onSelectionChange(updatedSelected);
    } else {
      // Add if not selected and within max limit
      if (!maxSelections || selectedValues.length < maxSelections) {
        const updatedSelected = [...selectedValues, option];
        onSelectionChange(updatedSelected);
      }
    }
    
    setQuery('');
    setShowDropdown(false);
    hideOverlay();
  }, [selectedValues, onSelectionChange, maxSelections, hideOverlay, selectedItemScale]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      setShowDropdown(true);
      // Show dropdown overlay after state update
      setTimeout(() => {
        showDropdownOverlay();
      }, 10);
    } else {
      setShowDropdown(false);
      hideOverlay();
    }
  };

  const showDropdownOverlay = () => {
    if (!showDropdown || disabled || dropdownPosition.width === 0) return;
    
    const dropdownContent = (
      <Animated.View
        entering={SlideInDown.duration(300)}
        exiting={SlideOutUp.duration(200)}
        style={styles.dropdown}
      >
        {filteredOptions.length > 0 ? (
          <ScrollView
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled={true}
          >
            {filteredOptions.map((item) => {
              const isSelected = selectedValues.some((selected) => selected.id === item.id);
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeIn.delay(filteredOptions.indexOf(item) * 50)}
                  exiting={FadeOut.duration(200)}
                >
                  <TouchableOpacity
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                    onPress={() => handleOptionSelect(item)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      isSelected && styles.dropdownItemTextSelected
                    ]}>
                      {item.content}
                    </Text>
                    {isSelected && (
                      <Animated.View entering={FadeIn.duration(300)}>
                        <Ionicons name="checkmark" size={16} color="#22d3ee" />
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No {fieldName.toLowerCase()} found</Text>
            {creatable && query.trim() && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNew}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <>
                    <Text style={styles.createButtonText}>Create</Text>
                    <Ionicons name="add" size={16} color="#000000" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.View>
    );
    
    showOverlay(dropdownContent, dropdownPosition);
  };

  const handleInputFocus = () => {
    if (containerRef.current) {
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY + height + 4,
          width: width,
        });
        
        // Show dropdown after position is set
        if (query.trim() || options.length > 0) {
          setShowDropdown(true);
          // Use setTimeout to ensure position is set before showing overlay
          setTimeout(() => {
            showDropdownOverlay();
          }, 10);
        }
      });
    }
  };

  const handleInputBlur = () => {
    // Don't hide dropdown immediately - let user interact with it
    // The dropdown will be hidden when an option is selected or when clicking outside
  };

  const handleRemoveSelection = (optionId: string) => {
    const updatedSelected = selectedValues.filter((option) => option.id !== optionId);
    onSelectionChange(updatedSelected);
  };

  const handleKeyPress = (nativeEvent: any) => {
    if (nativeEvent.key === 'Enter') {
      if (showDropdown && filteredOptions.length > 0) {
        // Select first suggestion
        handleOptionSelect(filteredOptions[0]);
      } else if (creatable && query.trim()) {
        // Create new option
        handleCreateNew();
      }
    }
  };

  const isMaxReached = maxSelections && selectedValues.length >= maxSelections;

  return (
    <View style={[styles.container, containerStyle]}>
      <View 
        ref={containerRef}
        style={[
          styles.inputContainer,
          disabled && styles.disabled,
          showDropdown && styles.inputContainerFocused
        ]}
      >
        {/* Selected Tags */}
        <View style={styles.selectedContainer}>
          {selectedValues.map((option) => (
            <Animated.View
              key={option.id}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.selectedTag}
            >
              <Text style={styles.selectedTagText}>{option.content}</Text>
              {!disabled && (
                <TouchableOpacity
                  onPress={() => handleRemoveSelection(option.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ))}
        </View>

        {/* Input */}
        {searchable && !disabled && !isMaxReached && (
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={placeholder || `Search and select ${fieldName.toLowerCase()}`}
            placeholderTextColor="rgba(156, 163, 175, 0.7)"
            value={query}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent)}
            editable={!disabled}
          />
        )}

        {/* Loading indicator */}
        {loading && (
          <ActivityIndicator size="small" color="#22d3ee" style={styles.loadingIndicator} />
        )}
      </View>

      {/* Max selections reached indicator */}
      {isMaxReached && (
        <Text style={styles.maxReachedText}>
          Maximum {maxSelections} {fieldName.toLowerCase()}(s) selected
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  inputContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: '#22d3ee',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  selectedTag: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.6)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTagText: {
    color: '#22d3ee',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    minWidth: 100,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  dropdown: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.5)',
    maxHeight: 180,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.4)',
    marginHorizontal: 4,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#22d3ee',
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  createButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  maxReachedText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default MultiSelectInput;
