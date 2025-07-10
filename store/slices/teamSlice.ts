import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface TeamMember {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  isPublic: boolean;
  memberCount: number;
  projectsCount: number;
  score: number;
  rank: number;
  ownerId: string;
  members: TeamMember[];
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  invitedBy: string;
  invitedByName: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface TeamState {
  teams: Team[];
  myTeams: Team[];
  selectedTeam: Team | null;
  invitations: TeamInvitation[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

// Initial state
const initialState: TeamState = {
  teams: [],
  myTeams: [],
  selectedTeam: null,
  invitations: [],
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async () => {
    const response = await fetch('/api/teams');
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return await response.json();
  }
);

export const fetchMyTeams = createAsyncThunk(
  'teams/fetchMyTeams',
  async () => {
    const response = await fetch('/api/teams/my');
    if (!response.ok) {
      throw new Error('Failed to fetch my teams');
    }
    return await response.json();
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (teamId: string) => {
    const response = await fetch(`/api/teams/${teamId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch team');
    }
    return await response.json();
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: Omit<Team, 'id' | 'ownerId' | 'members' | 'memberCount' | 'projectsCount' | 'score' | 'rank' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create team');
    }
    
    return await response.json();
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, updates }: { teamId: string; updates: Partial<Team> }) => {
    const response = await fetch(`/api/teams/${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update team');
    }
    
    return await response.json();
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string) => {
    const response = await fetch(`/api/teams/${teamId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete team');
    }
    
    return teamId;
  }
);

export const joinTeam = createAsyncThunk(
  'teams/joinTeam',
  async (inviteCode: string) => {
    const response = await fetch('/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to join team');
    }
    
    return await response.json();
  }
);

export const leaveTeam = createAsyncThunk(
  'teams/leaveTeam',
  async (teamId: string) => {
    const response = await fetch(`/api/teams/${teamId}/leave`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave team');
    }
    
    return teamId;
  }
);

export const inviteToTeam = createAsyncThunk(
  'teams/inviteToTeam',
  async ({ teamId, email }: { teamId: string; email: string }) => {
    const response = await fetch(`/api/teams/${teamId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send invitation');
    }
    
    return await response.json();
  }
);

export const fetchInvitations = createAsyncThunk(
  'teams/fetchInvitations',
  async () => {
    const response = await fetch('/api/teams/invitations');
    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }
    return await response.json();
  }
);

export const respondToInvitation = createAsyncThunk(
  'teams/respondToInvitation',
  async ({ invitationId, accept }: { invitationId: string; accept: boolean }) => {
    const response = await fetch(`/api/teams/invitations/${invitationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to respond to invitation');
    }
    
    return await response.json();
  }
);

export const updateMemberRole = createAsyncThunk(
  'teams/updateMemberRole',
  async ({ teamId, memberId, role }: { teamId: string; memberId: string; role: TeamMember['role'] }) => {
    const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update member role');
    }
    
    return await response.json();
  }
);

export const removeMember = createAsyncThunk(
  'teams/removeMember',
  async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
    const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove member');
    }
    
    return { teamId, memberId };
  }
);

// Team slice
const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch teams';
      })
      // Fetch my teams
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.myTeams = action.payload;
      })
      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch team';
      })
      // Create team
      .addCase(createTeam.fulfilled, (state, action) => {
        state.myTeams.unshift(action.payload);
        state.teams.unshift(action.payload);
      })
      // Update team
      .addCase(updateTeam.fulfilled, (state, action) => {
        const updateTeamInArray = (teams: Team[]) => {
          const index = teams.findIndex(t => t.id === action.payload.id);
          if (index !== -1) {
            teams[index] = action.payload;
          }
        };
        
        updateTeamInArray(state.teams);
        updateTeamInArray(state.myTeams);
        
        if (state.selectedTeam?.id === action.payload.id) {
          state.selectedTeam = action.payload;
        }
      })
      // Delete team
      .addCase(deleteTeam.fulfilled, (state, action) => {
        const removeFromArray = (teams: Team[]) => {
          return teams.filter(t => t.id !== action.payload);
        };
        
        state.teams = removeFromArray(state.teams);
        state.myTeams = removeFromArray(state.myTeams);
        
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = null;
        }
      })
      // Join team
      .addCase(joinTeam.fulfilled, (state, action) => {
        state.myTeams.push(action.payload);
      })
      // Leave team
      .addCase(leaveTeam.fulfilled, (state, action) => {
        state.myTeams = state.myTeams.filter(t => t.id !== action.payload);
        
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = null;
        }
      })
      // Fetch invitations
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload;
      })
      // Respond to invitation
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        const index = state.invitations.findIndex(inv => inv.id === action.payload.id);
        if (index !== -1) {
          state.invitations[index] = action.payload;
        }
        
        // If accepted, add team to myTeams
        if (action.payload.status === 'accepted' && action.payload.team) {
          state.myTeams.push(action.payload.team);
        }
      })
      // Update member role
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        if (state.selectedTeam) {
          const memberIndex = state.selectedTeam.members.findIndex(m => m.id === action.payload.memberId);
          if (memberIndex !== -1) {
            (state.selectedTeam as Team).members[memberIndex].role = action.payload.role;
          }
        }
      })
      // Remove member
      .addCase(removeMember.fulfilled, (state, action) => {
        if (state.selectedTeam?.id === action.payload.teamId) {
          (state.selectedTeam as Team).members = state.selectedTeam.members.filter(
            m => m.id !== action.payload.memberId
          );
          (state.selectedTeam as Team).memberCount -= 1;
        }
      });
  },
});

export const { clearError, setSearchQuery, clearSelectedTeam } = teamSlice.actions;
export default teamSlice.reducer;
