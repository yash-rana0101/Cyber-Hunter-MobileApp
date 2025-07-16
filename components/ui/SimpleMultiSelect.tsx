import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Simple option interface
export interface SelectOption {
  id: string;
  label: string;
}

interface SimpleMultiSelectProps {
  // Essential props
  value: SelectOption[];
  onChange: (selected: SelectOption[]) => void;
  placeholder?: string;

  // API props
  apiEndpoint?: string;
  onSearch?: (query: string) => Promise<SelectOption[]>;

  // Optional customization
  label?: string;
  maxSelections?: number;
  allowCreate?: boolean;
  onCreate?: (label: string) => Promise<SelectOption> | SelectOption;
  disabled?: boolean;
  loading?: boolean;

  // Styling
  style?: any;
  theme?: 'dark' | 'light';
}

const SimpleMultiSelect: React.FC<SimpleMultiSelectProps> = ({
  value = [],
  onChange,
  placeholder = 'Select options...',
  onSearch,
  label,
  maxSelections,
  allowCreate = false,
  onCreate,
  disabled = false,
  loading = false,
  style,
  theme = 'dark',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SelectOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotationValue = useSharedValue(0);

  // Handle search with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (searchText.trim() && onSearch) {
        setIsSearching(true);
        try {
          const results = await onSearch(searchText);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText, onSearch]);

  // Handle dropdown animation
  useEffect(() => {
    rotationValue.value = withSpring(isOpen ? 180 : 0);
  }, [isOpen, rotationValue]);

  const handleSelect = (option: SelectOption) => {
    if (disabled) return;

    const isSelected = value.some(item => item.id === option.id);

    if (isSelected) {
      // Remove if already selected
      onChange(value.filter(item => item.id !== option.id));
    } else {
      // Add if not selected and not at max
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, option]);
      }
    }

    if (maxSelections === 1) {
      setIsOpen(false);
      setSearchText('');
    }
  };

  const handleCreate = async () => {
    if (!onCreate || !searchText.trim() || creating) return;

    setCreating(true);
    try {
      const newOption = await onCreate(searchText.trim());
      onChange([...value, newOption]);
      setSearchText('');
      setSearchResults([]);
    } catch (error) {
      console.error('Create error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = (optionId: string) => {
    onChange(value.filter(item => item.id !== optionId));
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (!isOpen && text.trim()) {
      setIsOpen(true);
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const styles = getStyles(theme);
  const isMaxReached = maxSelections && value.length >= maxSelections;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Selected Items */}
      {value.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {value.map((item) => (
              <View key={item.id} style={styles.selectedItem}>
                <Text style={styles.selectedText}>{item.label}</Text>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Field */}
      <TouchableOpacity
        style={[styles.inputContainer, disabled && styles.disabled]}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme === 'dark' ? '#888' : '#666'}
          value={searchText}
          onChangeText={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          editable={!disabled}
        />

        {loading && <ActivityIndicator size="small" color="#0080ff" />}

        <Animated.View style={[styles.iconContainer, { transform: [{ rotate: `${rotationValue.value}deg` }] }]}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme === 'dark' ? '#fff' : '#000'}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown */}
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.dropdown}
        >
          <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0080ff" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  searchResults.map((option) => {
                    const isSelected = value.some(item => item.id === option.id);
                    const isMaxReachedAndNotSelected = isMaxReached && !isSelected;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.option,
                          isSelected && styles.selectedOption,
                          isMaxReachedAndNotSelected ? styles.disabledOption : null,
                        ]}
                        onPress={() => handleSelect(option)}
                        disabled={!!isMaxReachedAndNotSelected}
                      >
                        <Text style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                          isMaxReachedAndNotSelected ? styles.disabledOptionText : null,
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#0080ff" />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : searchText.trim() ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No results found</Text>
                    {allowCreate && onCreate && (
                      <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreate}
                        disabled={creating}
                      >
                        {creating ? (
                          <ActivityIndicator size="small" color="#0080ff" />
                        ) : (
                          <Text style={styles.createButtonText}>
                            Create &quot;{searchText}&quot;
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Start typing to search...</Text>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme === 'dark' ? '#fff' : '#000',
    marginBottom: 8,
  },
  selectedContainer: {
    marginBottom: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#59f1f7ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedText: {
    color: '#000',
    fontSize: 14,
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#00000' : '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#404040' : '#e0e0e0',
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
    zIndex: 2,
  },
  iconContainer: {
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme === 'dark' ? '#000000' : '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#00d9ffff' : '#e0e0e0',
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#00eeffff' : '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: theme === 'dark' ? '#000000ff' : '#e3f2fd',
    borderRadius: 8,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
  },
  selectedOptionText: {
    color: '#00eeffff',
    fontWeight: '600',
  },
  disabledOptionText: {
    color: theme === 'dark' ? '#666' : '#999',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme === 'dark' ? '#888' : '#666',
    textAlign: 'center',
  },
  createButton: {
    marginTop: 8,
    backgroundColor: '#04f7ffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme === 'dark' ? '#888' : '#666',
  },
});

export default SimpleMultiSelect;
