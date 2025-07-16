import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { SelectOption } from '../components/ui/SimpleMultiSelect';

interface UseMultiSelectOptions {
  initialValue?: SelectOption[];
  maxSelections?: number;
  onCreateApi?: (label: string) => Promise<any>;
  onSearchApi?: (query: string) => Promise<any[]>;
  onError?: (error: string) => void;
}

/**
 * Hook to simplify multi-select state management with search functionality
 * 
 * @example
 * const techStack = useMultiSelect({
 *   maxSelections: 5,
 *   onCreateApi: filterService.createTechStack,
 *   onSearchApi: filterService.getTechStacks,
 * });
 * 
 * <SimpleMultiSelect
 *   {...techStack.props}
 *   label="Tech Stack"
 *   placeholder="Search tech stack..."
 * />
 */
export const useMultiSelect = ({
  initialValue = [],
  maxSelections,
  onCreateApi,
  onSearchApi,
  onError = (error) => Alert.alert('Error', error),
}: UseMultiSelectOptions = {}) => {
  const [value, setValue] = useState<SelectOption[]>(initialValue);
  const [creating, setCreating] = useState(false);

  const handleChange = useCallback((selected: SelectOption[]) => {
    setValue(selected);
  }, []);

  const handleSearch = useCallback(async (query: string): Promise<SelectOption[]> => {
    if (!onSearchApi) {
      return [];
    }

    try {
      const results = await onSearchApi(query);
      return results.map((item: any) => ({
        id: item.id || item._id || item.tagId,
        label: item.content || item.name || item.label,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search';
      onError(errorMessage);
      return [];
    }
  }, [onSearchApi, onError]);

  const handleCreate = useCallback(async (label: string): Promise<SelectOption> => {
    if (!onCreateApi) {
      throw new Error('No create API provided');
    }

    try {
      setCreating(true);
      const newItem = await onCreateApi(label);
      
      const newOption: SelectOption = {
        id: newItem.id || newItem._id || newItem.tagId,
        label: newItem.content || newItem.name || newItem.label || label,
      };

      return newOption;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      onError(errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [onCreateApi, onError]);

  const reset = useCallback(() => {
    setValue([]);
  }, []);

  const addItem = useCallback((item: SelectOption) => {
    setValue(prev => {
      if (prev.some(p => p.id === item.id)) return prev;
      if (maxSelections && prev.length >= maxSelections) return prev;
      return [...prev, item];
    });
  }, [maxSelections]);

  const removeItem = useCallback((itemId: string) => {
    setValue(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const hasItem = useCallback((itemId: string) => {
    return value.some(item => item.id === itemId);
  }, [value]);

  const isMaxReached = maxSelections ? value.length >= maxSelections : false;

  return {
    value,
    setValue,
    creating,
    isMaxReached,
    
    // Actions
    reset,
    addItem,
    removeItem,
    hasItem,
    
    // Props to spread directly into SimpleMultiSelect
    props: {
      value,
      onChange: handleChange,
      onCreate: onCreateApi ? handleCreate : undefined,
      onSearch: onSearchApi ? handleSearch : undefined,
      allowCreate: !!onCreateApi,
      maxSelections,
      loading: creating,
    },
  };
};

/**
 * Example usage:
 * 
 * const techStack = useMultiSelect({
 *   maxSelections: 5,
 *   onCreateApi: (label) => filterService.createTechStack(label),
 *   onSearchApi: (query) => filterService.getTechStacks(query),
 * });
 * 
 * <SimpleMultiSelect
 *   {...techStack.props}
 *   label="Tech Stack"
 *   placeholder="Search technologies..."
 * />
 */

export default useMultiSelect;
