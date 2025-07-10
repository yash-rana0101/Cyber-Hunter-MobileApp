import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Badge {
  id: string;
  name: string;
  color: 'gold' | 'silver' | 'purple' | 'cyan' | 'orange' | 'green';
  icon: string;
  earnedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'design' | 'security';
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  company?: string;
  position?: string;
  education?: string;
  badges: Badge[];
  skills: Skill[];
  socialLinks: SocialLinks;
  score: number;
  rank: number;
  projectsCount: number;
  teamsCount: number;
  achievements: number;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  profileCompletionPercentage: number;
}

// Initial state
const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  profileCompletionPercentage: 0,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<UserProfile>) => {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return await response.json();
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageUri: string) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    
    const response = await fetch('/api/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
    
    return await response.json();
  }
);

export const addSkill = createAsyncThunk(
  'user/addSkill',
  async (skill: Omit<Skill, 'id'>) => {
    const response = await fetch('/api/users/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skill),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add skill');
    }
    
    return await response.json();
  }
);

export const updateSkill = createAsyncThunk(
  'user/updateSkill',
  async ({ skillId, updates }: { skillId: string; updates: Partial<Skill> }) => {
    const response = await fetch(`/api/users/skills/${skillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update skill');
    }
    
    return await response.json();
  }
);

// Helper function to calculate profile completion
const calculateProfileCompletion = (profile: UserProfile): number => {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.bio,
    profile.avatar,
    profile.location,
    profile.company,
    profile.position,
    profile.education,
    profile.socialLinks.github,
    profile.skills.length > 0,
  ];
  
  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSocialLinks: (state, action: PayloadAction<SocialLinks>) => {
      if (state.profile) {
        state.profile.socialLinks = { ...state.profile.socialLinks, ...action.payload };
        state.profileCompletionPercentage = calculateProfileCompletion(state.profile);
      }
    },
    removeSkill: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.skills = state.profile.skills.filter(skill => skill.id !== action.payload);
        state.profileCompletionPercentage = calculateProfileCompletion(state.profile);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.profileCompletionPercentage = calculateProfileCompletion(action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
          state.profileCompletionPercentage = calculateProfileCompletion(state.profile as UserProfile);
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update profile';
      })
      // Upload avatar
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatar = action.payload.avatarUrl;
          state.profileCompletionPercentage = calculateProfileCompletion(state.profile);
        }
      })
      // Add skill
      .addCase(addSkill.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.skills.push(action.payload);
          state.profileCompletionPercentage = calculateProfileCompletion(state.profile);
        }
      })
      // Update skill
      .addCase(updateSkill.fulfilled, (state, action) => {
        if (state.profile) {
          const index = state.profile.skills.findIndex(skill => skill.id === action.payload.id);
          if (index !== -1) {
            state.profile.skills[index] = action.payload;
          }
        }
      });
  },
});

export const { clearError, updateSocialLinks, removeSkill } = userSlice.actions;
export default userSlice.reducer;
