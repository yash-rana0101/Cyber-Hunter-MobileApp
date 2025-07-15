import api from './api';

export interface LeaderboardUser {
  userId: string;
  rank: number;
  name: string;
  email: string;
  points: number;
  profilePicture?: string;
  techStack: string;
  language: string;
}

export interface LeaderboardTeam {
  teamId: string;
  rank: number;
  name: string;
  points: number;
  teamLogo?: string;
  members: number;
  techStack: string;
}

export interface LeaderboardFilters {
  techStacks: string[];
  languages: string[];
  tags: string[];
}

export interface LeaderboardParams {
  type: 'individual' | 'team';
  search?: string;
  techStack?: string;
  language?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface LeaderboardResponse {
  results: LeaderboardUser[] | LeaderboardTeam[];
  topThree: LeaderboardUser[] | LeaderboardTeam[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export const leaderboardService = {
  // Get leaderboard data
  async getLeaderboard(params: LeaderboardParams): Promise<LeaderboardResponse> {
    const response = await api.get('/api/v1/leaderboard', { params });
    return response.data.data;
  },

  // Get leaderboard filters
  async getFilters(): Promise<LeaderboardFilters> {
    const response = await api.get('/api/v1/leaderboard/filters');
    return response.data.data;
  },

  // Update leaderboard rankings (admin only)
  async updateRankings(): Promise<void> {
    await api.post('/api/v1/leaderboard/update-rankings');
  },

  // Initialize leaderboard (admin only)
  async initializeLeaderboard(): Promise<void> {
    await api.post('/api/v1/leaderboard/initialize');
  },

  // Refresh leaderboard (admin only)
  async refreshLeaderboard(): Promise<void> {
    await api.post('/api/v1/leaderboard/refresh');
  },
};
