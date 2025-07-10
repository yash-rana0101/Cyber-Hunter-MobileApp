import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  projectsCount: number;
  teamsCount: number;
  achievementsCount: number;
  change: number; // Position change from last period
  badges: string[];
}

export interface LeaderboardTeam {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  memberCount: number;
  projectsCount: number;
  change: number;
  ownerId: string;
  ownerName: string;
}

export interface LeaderboardFilter {
  type: 'users' | 'teams';
  period: 'weekly' | 'monthly' | 'yearly' | 'all-time';
  techStack?: string[];
  language?: string;
  category?: string;
}

export interface LeaderboardState {
  users: LeaderboardUser[];
  teams: LeaderboardTeam[];
  myRank: {
    user?: number;
    team?: number;
  };
  isLoading: boolean;
  error: string | null;
  filter: LeaderboardFilter;
  lastUpdated: string | null;
}

// Initial state
const initialState: LeaderboardState = {
  users: [],
  teams: [],
  myRank: {},
  isLoading: false,
  error: null,
  filter: {
    type: 'users',
    period: 'all-time',
  },
  lastUpdated: null,
};

// Async thunks
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (filter: LeaderboardFilter) => {
    const params = new URLSearchParams({
      type: filter.type,
      period: filter.period,
    });
    
    if (filter.techStack) {
      filter.techStack.forEach(tech => params.append('techStack', tech));
    }
    if (filter.language) params.append('language', filter.language);
    if (filter.category) params.append('category', filter.category);
    
    const response = await fetch(`/api/leaderboard?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    const data = await response.json();
    return { ...data, filter };
  }
);

export const fetchUserRank = createAsyncThunk(
  'leaderboard/fetchUserRank',
  async (userId: string) => {
    const response = await fetch(`/api/leaderboard/user/${userId}/rank`);
    if (!response.ok) {
      throw new Error('Failed to fetch user rank');
    }
    return await response.json();
  }
);

export const fetchTeamRank = createAsyncThunk(
  'leaderboard/fetchTeamRank',
  async (teamId: string) => {
    const response = await fetch(`/api/leaderboard/team/${teamId}/rank`);
    if (!response.ok) {
      throw new Error('Failed to fetch team rank');
    }
    return await response.json();
  }
);

export const fetchTopPerformers = createAsyncThunk(
  'leaderboard/fetchTopPerformers',
  async ({ period = 'weekly', limit = 10 }: { period?: string; limit?: number } = {}) => {
    const response = await fetch(`/api/leaderboard/top?period=${period}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch top performers');
    }
    return await response.json();
  }
);

export const fetchScoreHistory = createAsyncThunk(
  'leaderboard/fetchScoreHistory',
  async ({ userId, period = '30d' }: { userId: string; period?: string }) => {
    const response = await fetch(`/api/leaderboard/user/${userId}/history?period=${period}`);
    if (!response.ok) {
      throw new Error('Failed to fetch score history');
    }
    return await response.json();
  }
);

export const fetchLeaderboardStats = createAsyncThunk(
  'leaderboard/fetchStats',
  async () => {
    const response = await fetch('/api/leaderboard/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard stats');
    }
    return await response.json();
  }
);

// Leaderboard slice
const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<Partial<LeaderboardFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    updateUserScore: (state, action: PayloadAction<{ userId: string; newScore: number }>) => {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (user) {
        user.score = action.payload.newScore;
        // Re-sort users by score
        state.users.sort((a, b) => b.score - a.score);
        // Update ranks
        state.users.forEach((user, index) => {
          user.rank = index + 1;
        });
      }
    },
    updateTeamScore: (state, action: PayloadAction<{ teamId: string; newScore: number }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.score = action.payload.newScore;
        // Re-sort teams by score
        state.teams.sort((a, b) => b.score - a.score);
        // Update ranks
        state.teams.forEach((team, index) => {
          team.rank = index + 1;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.filter.type === 'users') {
          state.users = action.payload.data;
        } else {
          state.teams = action.payload.data;
        }
        state.filter = action.payload.filter;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch leaderboard';
      })
      // Fetch user rank
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.myRank.user = action.payload.rank;
      })
      // Fetch team rank
      .addCase(fetchTeamRank.fulfilled, (state, action) => {
        state.myRank.team = action.payload.rank;
      })
      // Fetch top performers
      .addCase(fetchTopPerformers.fulfilled, (state, action) => {
        // This could be used to highlight top performers in the UI
        // For now, we just store the current leaderboard data
      })
      // Fetch score history
      .addCase(fetchScoreHistory.fulfilled, (state, action) => {
        // This data would be used for charts/graphs
        // Store in a separate property if needed for analytics
      })
      // Fetch stats
      .addCase(fetchLeaderboardStats.fulfilled, (state, action) => {
        // Store global stats for dashboard
        // Could include total users, total teams, average scores, etc.
      });
  },
});

export const { 
  clearError, 
  setFilter, 
  updateUserScore, 
  updateTeamScore 
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
