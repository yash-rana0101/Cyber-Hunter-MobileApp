import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

// Import slices
import authSlice from '../store/slices/authSlice';
import leaderboardSlice from './slices/leaderboardSlice';
import notificationSlice from './slices/notificationSlice';
import projectSlice from './slices/projectSlice';
import teamSlice from './slices/teamSlice';
import userSlice from './slices/userSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user data
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  projects: projectSlice,
  teams: teamSlice,
  notifications: notificationSlice,
  leaderboard: leaderboardSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
