import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'achievement' | 'team_invite' | 'project_like' | 'project_comment';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  achievementNotifications: boolean;
  teamNotifications: boolean;
  projectNotifications: boolean;
  leaderboardNotifications: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: NotificationPreferences;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  preferences: {
    pushNotifications: true,
    emailNotifications: true,
    achievementNotifications: true,
    teamNotifications: true,
    projectNotifications: true,
    leaderboardNotifications: true,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) => {
    const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const response = await fetch('/api/notifications/read-all', {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return true;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    
    return notificationId;
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAllNotifications',
  async () => {
    const response = await fetch('/api/notifications', {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear all notifications');
    }
    
    return true;
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences: Partial<NotificationPreferences>) => {
    const response = await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }
    
    return await response.json();
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'notifications/fetchPreferences',
  async () => {
    const response = await fetch('/api/notifications/preferences');
    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }
    return await response.json();
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    removeExpiredNotifications: (state) => {
      const now = new Date().toISOString();
      const unexpiredNotifications = state.notifications.filter(
        notification => !notification.expiresAt || notification.expiresAt > now
      );
      
      const removedCount = state.notifications.length - unexpiredNotifications.length;
      const removedUnreadCount = state.notifications
        .slice(0, removedCount)
        .filter(n => !n.isRead).length;
      
      state.notifications = unexpiredNotifications;
      state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount);
    },
    markAsReadLocally: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })
      // Update preferences
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      })
      // Fetch preferences
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { 
  clearError, 
  addNotification, 
  removeExpiredNotifications, 
  markAsReadLocally 
} = notificationSlice.actions;

export default notificationSlice.reducer;
