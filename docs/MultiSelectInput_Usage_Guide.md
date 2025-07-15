# MultiSelectInput Component Usage Guide

## Overview
The `MultiSelectInput` component is a powerful, reusable component for handling multiple selections with search, create functionality, and a modern UI design. It's now implemented in the LeaderboardScreen and can be used throughout the app for tech stacks, languages, tags, and other multi-selection scenarios.

## Features
- ✅ Multiple item selection with visual tags
- ✅ Search/filter functionality
- ✅ Create new items on-the-fly
- ✅ Configurable max selections
- ✅ Modern glassmorphism design
- ✅ Smooth animations
- ✅ TypeScript support
- ✅ API integration ready

## Implementation Status

### ✅ Completed
- **LeaderboardScreen**: Fully implemented with tech stack, language, and tag filters
- **MultiSelectInput Component**: Complete with all features
- **Filter Services**: API integration for creating and fetching options

### 🚧 Ready for Integration
- EditProjectScreen (new version created: `EditProjectScreen_new.tsx`)
- CreateTeamScreen
- UserDetailsScreen
- ProfileScreen
- Any other screen with multi-selection needs

## Usage Examples

### Basic Usage
```tsx
import MultiSelectInput from '../../components/ui/MultiSelectInput';
import { FilterOption } from '../../services/filters';

const [selectedItems, setSelectedItems] = useState<FilterOption[]>([]);
const [options, setOptions] = useState<FilterOption[]>([]);

<MultiSelectInput
  fieldName="Tech Stack"
  placeholder="Select technologies..."
  options={options}
  selectedValues={selectedItems}
  onSelectionChange={setSelectedItems}
  maxSelections={5}
/>
```

### With Create Functionality
```tsx
const handleCreate = async (content: string): Promise<FilterOption> => {
  try {
    const newOption = await filterService.createTechStack(content);
    setOptions(prev => [...prev, newOption]);
    return newOption;
  } catch (error) {
    console.error('Error creating option:', error);
    throw error;
  }
};

<MultiSelectInput
  fieldName="Tech Stack"
  placeholder="Select or create technologies..."
  options={options}
  selectedValues={selectedItems}
  onSelectionChange={setSelectedItems}
  onCreateNew={handleCreate}
  maxSelections={10}
  searchable={true}
  creatable={true}
/>
```

### Integration with API Services
```tsx
// Use the filterService for consistent API calls
import { filterService } from '../../services/filters';

// Load options
useEffect(() => {
  const loadOptions = async () => {
    try {
      const [techStacks, languages, tags] = await Promise.all([
        filterService.getTechStacks(),
        filterService.getLanguages(),
        filterService.getTags(),
      ]);
      setTechStackOptions(techStacks);
      setLanguageOptions(languages);
      setTagOptions(tags);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };
  loadOptions();
}, []);
```

## Component Props

### Required Props
- `options`: Array of FilterOption objects
- `selectedValues`: Currently selected FilterOption objects
- `onSelectionChange`: Callback when selection changes

### Optional Props
- `fieldName`: Display name for the field (default: "Option")
- `placeholder`: Input placeholder text
- `onCreateNew`: Function to create new options
- `maxSelections`: Maximum number of selections allowed
- `searchable`: Enable search functionality (default: true)
- `creatable`: Enable create new functionality (default: false)
- `loading`: Show loading state (default: false)
- `disabled`: Disable the component (default: false)
- `containerStyle`: Custom container styling

## Data Structure

### FilterOption Interface
```typescript
interface FilterOption {
  id: string;
  content: string;
}
```

### API Response Format
The component expects API responses in this format:
```typescript
// Tech Stacks
{
  tagId: string,      // or _id
  content: string,
  logo?: string
}

// Languages
{
  tagId: string,      // or _id
  content: string,
  logo?: string
}

// Tags
{
  tagId: string,      // or _id
  content: string
}
```

## Styling

The component uses a consistent design system:
- Dark theme with glassmorphism effects
- Cyan accent color (#22d3ee)
- Smooth animations and transitions
- Responsive design
- Consistent with app's overall aesthetic

### Custom Styling
```tsx
<MultiSelectInput
  // ... other props
  containerStyle={{
    marginBottom: 16,
    // your custom styles
  }}
/>
```

## Integration Steps

### 1. For Project Forms (Create/Edit)
```tsx
// Update your form data interface
interface ProjectData {
  // ... other fields
  techStack: FilterOption[];
  language: FilterOption[];
  tagId: FilterOption[];
}

// Replace existing tag input sections with MultiSelectInput
// See EditProjectScreen_new.tsx for complete example
```

### 2. For Team Forms
```tsx
// Update team form data
interface TeamData {
  // ... other fields
  techStack: FilterOption[];
  interests: FilterOption[];
}

// Replace chip selection with MultiSelectInput
// Refer to the CreateTeamScreen_MultiSelectExample.tsx for details
```

### 3. For User Profile
```tsx
// Update user profile for skills/technologies
interface UserProfile {
  // ... other fields
  skills: FilterOption[];
  techStack: FilterOption[];
  languages: FilterOption[];
}
```

## API Integration

### Backend Requirements
Ensure your backend supports:
- GET endpoints for fetching options with search
- POST endpoints for creating new options
- Proper response format matching FilterOption interface

### Example API Calls
```typescript
// GET /api/v1/techstack?q=react
// GET /api/v1/language?q=java
// GET /api/v1/tag?q=web

// POST /api/v1/techstack
// Body: { content: "New Tech" }
// Response: { tagId: "123", content: "New Tech", logo: "..." }
```

## Testing

The component has been tested in:
- ✅ LeaderboardScreen (production ready)
- ✅ EditProjectScreen_new.tsx (ready for deployment)
- 🧪 Various filter scenarios
- 🧪 Create new item functionality
- 🧪 Error handling
- 🧪 Loading states

## Migration Guide

### From Simple Text Inputs
1. Replace TextInput with MultiSelectInput
2. Update state from string[] to FilterOption[]
3. Add option loading logic
4. Update form submission to extract IDs/content

### From Chip Selection
1. Replace TouchableOpacity chips with MultiSelectInput
2. Remove manual chip rendering logic
3. Update selection handlers
4. Maintain existing data structure in API calls

## Best Practices

1. **Performance**: Load options once and cache them
2. **UX**: Provide clear placeholder text
3. **Validation**: Set appropriate maxSelections
4. **Error Handling**: Handle API errors gracefully
5. **Accessibility**: Component includes proper accessibility features
6. **Consistency**: Use the same FilterOption interface throughout

## Support

For questions or issues:
1. Check existing implementation in LeaderboardScreen
2. Review EditProjectScreen_new.tsx for complete example
3. Refer to filterService for API integration patterns
4. Check MultiSelectInput component for prop details

## Next Steps

1. Deploy EditProjectScreen_new.tsx to replace existing EditProjectScreen
2. Update CreateTeamScreen with MultiSelectInput
3. Integrate into UserDetailsScreen for skills selection
4. Add to ProfileScreen for skills editing
5. Consider adding to any other multi-selection scenarios

The component is production-ready and actively used in the LeaderboardScreen. The integration pattern is established and can be replicated across the app for consistent user experience.
