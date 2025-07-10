import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { teamService } from '../services/api';

// Define team types
export interface TeamMember {
  userId: string;
  role: string;
  status: string;
  points: number;
}

export interface JoinRequest {
  _id: string;
  userId: string;
  message: string;
  status: string;
  requestedAt: string;
  respondedAt?: string;
  userData?: {
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export interface Team {
  _id: string;
  TeamName: string;
  TeamDescription: string;
  TeamLogo?: string;
  TeamCreaterId: string;
  TeamMembers: TeamMember[];
  techStack: string[];
  interests: string[];
  joinRequests: JoinRequest[];
  points: number;
  isPrivate?: boolean; // Added for frontend compatibility
  memberCount?: number; // Added for frontend convenience
  maxMembers?: number; // Added for frontend convenience
}

type TeamContextType = {
  teams: Team[];
  userTeam: Team | null;
  isLoading: boolean;
  loadTeams: () => Promise<void>;
  getTeamById: (id: string) => Promise<Team | null>;
  requestToJoinTeam: (teamId: string, message?: string) => Promise<boolean>;
  hasActiveJoinRequest: (teamId: string) => boolean;
  pendingJoinRequests: JoinRequest[];
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<JoinRequest[]>([]);
  

  // Define functions with useCallback
  const loadTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all teams
      const allTeamsResponse = await teamService.getAllTeams();
      
      if (allTeamsResponse?.data) {
        // Process teams for the frontend
        const processedTeams = allTeamsResponse.data.map((team: any) => ({
          ...team,
          memberCount: team.TeamMembers.length,
          maxMembers: 5, // Max members from backend logic
          isPrivate: team.isPrivate || false,
        }));
        
        setTeams(processedTeams);
      }
      
      
    } catch (error) {
      console.error('Failed to load teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user's join requests
  const loadUserJoinRequests = useCallback(async () => {
    try {
      const response = await teamService.getUserJoinRequests();
      if (response?.data) {
        setPendingJoinRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to load join requests:', error);
    }
  }, []);

  // Add useEffect to load data when user changes
  // useEffect(() => {
  //   if (user) {
  //     loadTeams();
  //     loadUserJoinRequests();
  //   } else {
  //     setTeams([]);
  //     setUserTeam(null);
  //   }
  // }, [user, loadTeams, loadUserJoinRequests]);

  // Get a team by ID
  const getTeamById = useCallback(async (id: string): Promise<Team | null> => {
    try {
      const response = await teamService.getTeamById(id);
      if (response?.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get team ${id}:`, error);
      return null;
    }
  }, []);

  // Request to join a team
  const requestToJoinTeam = useCallback(async (teamId: string, message: string = ''): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await teamService.requestToJoinTeam(teamId, message);
      
      if (response?.success) {
        // Refresh user's join requests
        await loadUserJoinRequests();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to request joining team:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send join request. Please try again.';
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserJoinRequests]);

  // Check if user has an active join request for a team
  const hasActiveJoinRequest = useCallback((teamId: string): boolean => {
    return pendingJoinRequests.some(request => 
      request.status === 'pending' || request.status === 'invited'
    );
  }, [pendingJoinRequests]);

  return (
    <TeamContext.Provider
      value={{
        teams,
        userTeam,
        isLoading,
        loadTeams,
        getTeamById,
        requestToJoinTeam,
        hasActiveJoinRequest,
        pendingJoinRequests
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
