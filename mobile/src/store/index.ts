import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice';
import feedReducer from './slices/feedSlice';
import communityReducer from './slices/communitySlice';
import eventsReducer from './slices/eventsSlice';
import notificationsReducer from './slices/notificationsSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    feed: feedReducer,
    community: communityReducer,
    events: eventsReducer,
    notifications: notificationsReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
