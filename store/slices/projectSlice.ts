import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface TechStack {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'database' | 'devops' | 'design' | 'security';
  color: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail?: string;
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  techStack: TechStack[];
  language: string;
  tags: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  teamId?: string;
  teamName?: string;
  isVerified: boolean;
  isPublic: boolean;
  likes: number;
  views: number;
  forks: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilter {
  techStack?: string[];
  language?: string;
  tags?: string[];
  status?: 'all' | 'draft' | 'published' | 'archived';
  sortBy?: 'newest' | 'oldest' | 'mostLiked' | 'mostViewed';
}

export interface ProjectState {
  projects: Project[];
  myProjects: Project[];
  teamProjects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filter: ProjectFilter;
  searchQuery: string;
  hasMore: boolean;
  page: number;
}

// Initial state
const initialState: ProjectState = {
  projects: [],
  myProjects: [],
  teamProjects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  filter: {
    status: 'all',
    sortBy: 'newest',
  },
  searchQuery: '',
  hasMore: true,
  page: 1,
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async ({ page = 1, reset = false }: { page?: number; reset?: boolean } = {}) => {
    const response = await fetch(`/api/projects?page=${page}&limit=10`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await response.json();
    return { ...data, reset };
  }
);

export const fetchMyProjects = createAsyncThunk(
  'projects/fetchMyProjects',
  async () => {
    const response = await fetch('/api/projects/my');
    if (!response.ok) {
      throw new Error('Failed to fetch my projects');
    }
    return await response.json();
  }
);

export const fetchTeamProjects = createAsyncThunk(
  'projects/fetchTeamProjects',
  async (teamId: string) => {
    const response = await fetch(`/api/teams/${teamId}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch team projects');
    }
    return await response.json();
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return await response.json();
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Omit<Project, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'createdAt' | 'updatedAt' | 'likes' | 'views' | 'forks'>) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    
    return await response.json();
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    
    return await response.json();
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    
    return projectId;
  }
);

export const likeProject = createAsyncThunk(
  'projects/likeProject',
  async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}/like`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to like project');
    }
    
    return await response.json();
  }
);

export const searchProjects = createAsyncThunk(
  'projects/searchProjects',
  async ({ query, filter }: { query: string; filter?: ProjectFilter }) => {
    const params = new URLSearchParams({ q: query });
    
    if (filter?.language) params.append('language', filter.language);
    if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.techStack) filter.techStack.forEach(tech => params.append('techStack', tech));
    if (filter?.tags) filter.tags.forEach(tag => params.append('tags', tag));
    
    const response = await fetch(`/api/projects/search?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search projects');
    }
    
    return await response.json();
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<ProjectFilter>) => {
      state.filter = { ...state.filter, ...action.payload };
      state.page = 1;
      state.hasMore = true;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    resetProjects: (state) => {
      state.projects = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.reset) {
          state.projects = action.payload.projects;
        } else {
          state.projects = [...state.projects, ...action.payload.projects];
        }
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      // Fetch my projects
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.myProjects = action.payload;
      })
      // Fetch team projects
      .addCase(fetchTeamProjects.fulfilled, (state, action) => {
        state.teamProjects = action.payload;
      })
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch project';
      })
      // Create project
      .addCase(createProject.fulfilled, (state, action) => {
        state.myProjects.unshift(action.payload);
        state.projects.unshift(action.payload);
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const updateProjectInArray = (projects: Project[]) => {
          const index = projects.findIndex(p => p.id === action.payload.id);
          if (index !== -1) {
            projects[index] = action.payload;
          }
        };
        
        updateProjectInArray(state.projects);
        updateProjectInArray(state.myProjects);
        updateProjectInArray(state.teamProjects);
        
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        const removeFromArray = (projects: Project[]) => {
          return projects.filter(p => p.id !== action.payload);
        };
        
        state.projects = removeFromArray(state.projects);
        state.myProjects = removeFromArray(state.myProjects);
        state.teamProjects = removeFromArray(state.teamProjects);
        
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null;
        }
      })
      // Like project
      .addCase(likeProject.fulfilled, (state, action) => {
        const updateLikes = (projects: Project[]) => {
          const index = projects.findIndex(p => p.id === action.payload.projectId);
          if (index !== -1) {
            projects[index].likes = action.payload.likes;
          }
        };
        
        updateLikes(state.projects);
        updateLikes(state.myProjects);
        updateLikes(state.teamProjects);
        
        if (state.selectedProject?.id === action.payload.projectId) {
          (state.selectedProject as Project).likes = action.payload.likes;
        }
      })
      // Search projects
      .addCase(searchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.hasMore = false;
      });
  },
});

export const { 
  clearError, 
  setFilter, 
  setSearchQuery, 
  clearSelectedProject, 
  resetProjects 
} = projectSlice.actions;

export default projectSlice.reducer;
