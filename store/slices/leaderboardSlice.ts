import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  LeaderboardFilters,
  LeaderboardParams,
  LeaderboardResponse,
  leaderboardService
} from '../../services/leaderboard';

// Redux state interface
export interface LeaderboardState {
  data: LeaderboardResponse | null;
  filters: LeaderboardFilters | null;
  isLoading: boolean;
  error: string | null;
  params: LeaderboardParams;
  lastUpdated: string | null;
}

// Initial state
const initialState: LeaderboardState = {
  data: null,
  filters: null,
  isLoading: false,
  error: null,
  params: {
    type: 'individual',
    page: 1,
    limit: 20,
  },
  lastUpdated: null,
};

// Async thunks
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (params: LeaderboardParams, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getLeaderboard(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchLeaderboardFilters = createAsyncThunk(
  'leaderboard/fetchFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getFilters();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch filters');
    }
  }
);

export const refreshLeaderboard = createAsyncThunk(
  'leaderboard/refreshLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      await leaderboardService.refreshLeaderboard();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh leaderboard');
    }
  }
);

// Slice
const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setParams: (state, action: PayloadAction<Partial<LeaderboardParams>>) => {
      state.params = { ...state.params, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLeaderboard: (state) => {
      state.data = null;
      state.error = null;
      state.params = initialState.params;
    },
  },
  extraReducers: (builder) => {
    // Fetch leaderboard
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch filters
    builder
      .addCase(fetchLeaderboardFilters.pending, (state) => {
        // Don't set loading for filters as it's usually fetched alongside main data
      })
      .addCase(fetchLeaderboardFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      })
      .addCase(fetchLeaderboardFilters.rejected, (state, action) => {
        // Don't set error for filters as it's not critical
        console.error('Failed to fetch leaderboard filters:', action.payload);
      });

    // Refresh leaderboard
    builder
      .addCase(refreshLeaderboard.pending, (state) => {
        // Don't set loading for refresh as it's an admin action
      })
      .addCase(refreshLeaderboard.fulfilled, (state) => {
        // Refresh successful, could trigger a re-fetch
      })
      .addCase(refreshLeaderboard.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setParams, clearError, resetLeaderboard } = leaderboardSlice.actions;

// Export selectors
export const selectLeaderboardData = (state: { leaderboard: LeaderboardState }) => state.leaderboard.data;
export const selectLeaderboardFilters = (state: { leaderboard: LeaderboardState }) => state.leaderboard.filters;
export const selectLeaderboardLoading = (state: { leaderboard: LeaderboardState }) => state.leaderboard.isLoading;
export const selectLeaderboardError = (state: { leaderboard: LeaderboardState }) => state.leaderboard.error;
export const selectLeaderboardParams = (state: { leaderboard: LeaderboardState }) => state.leaderboard.params;
export const selectLeaderboardLastUpdated = (state: { leaderboard: LeaderboardState }) => state.leaderboard.lastUpdated;

// Export reducer
export default leaderboardSlice.reducer;
