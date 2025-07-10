import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  walletAddress?: string;
  isVerified: boolean;
  authMethod: 'email' | 'google' | 'github' | 'wallet';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingCompleted: boolean;
  onboardingChecked: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  onboardingCompleted: false,
  onboardingChecked: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Mock validation
    if (email === 'admin@example.com' && password === 'password123') {
      const mockData = {
        user: {
          id: '1',
          email: email,
          username: 'admin',
          isVerified: true,
          authMethod: 'email' as const,
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };
      
      await AsyncStorage.setItem('token', mockData.token);
      await AsyncStorage.setItem('refreshToken', mockData.refreshToken);
      
      return mockData;
    } else {
      throw new Error('Invalid credentials');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleToken: string) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken }),
    });
    
    if (!response.ok) {
      throw new Error('Google login failed');
    }
    
    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }
);

export const loginWithWallet = createAsyncThunk(
  'auth/loginWithWallet',
  async ({ walletAddress, signature }: { walletAddress: string; signature: string }) => {
    const response = await fetch('/api/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, signature }),
    });
    
    if (!response.ok) {
      throw new Error('Wallet login failed');
    }
    
    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, username }: { email: string; password: string; username: string }) => {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Mock validation
    if (email && password && username) {
      const mockData = {
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email: email,
          username: username,
          isVerified: false,
          authMethod: 'email' as const,
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };
      
      await AsyncStorage.setItem('token', mockData.token);
      await AsyncStorage.setItem('refreshToken', mockData.refreshToken);
      
      return mockData;
    } else {
      throw new Error('All fields are required');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['token', 'refreshToken']);
  return null;
});

export const checkAuthStatus = createAsyncThunk('auth/checkAuthStatus', async () => {
  const token = await AsyncStorage.getItem('token');
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  if (token && refreshToken) {
    // In a real app, you would validate the token with your backend
    // For now, we'll assume the token is valid if it exists
    return {
      user: {
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        isVerified: true,
        authMethod: 'email' as const,
      },
      token,
      refreshToken,
    };
  }
  
  throw new Error('No valid token found');
});

// Async thunk to check onboarding status
export const checkOnboardingStatus = createAsyncThunk(
  'auth/checkOnboardingStatus',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    // Only check storage if not already set in state
    if (!state.auth.onboardingChecked) {
      const status = await AsyncStorage.getItem('onboardingCompleted');
      return status === 'true';
    }
    return state.auth.onboardingCompleted;
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOnboardingCompleted: (state) => {
      state.onboardingCompleted = true;
      state.onboardingChecked = true;
      AsyncStorage.setItem('onboardingCompleted', 'true');
    },
    resetOnboardingCompleted: (state) => {
      state.onboardingCompleted = false;
      state.onboardingChecked = false;
      AsyncStorage.removeItem('onboardingCompleted');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Google login
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      // Wallet login
      .addCase(loginWithWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      // Check onboarding status
      .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
        state.onboardingCompleted = action.payload;
        state.onboardingChecked = true;
      })
      .addCase(checkOnboardingStatus.rejected, (state) => {
        state.onboardingChecked = true;
        state.onboardingCompleted = false;
      });
  },
});

export const { clearError, setOnboardingCompleted, resetOnboardingCompleted, setUser } = authSlice.actions;

// Helper function to reset onboarding (for testing)
export const resetOnboarding = () => (dispatch: any) => {
  dispatch(resetOnboardingCompleted());
};

export default authSlice.reducer;
