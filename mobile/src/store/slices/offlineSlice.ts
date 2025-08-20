import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  retryCount: number;
}

export interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  syncing: boolean;
  lastSync: string | null;
  cache: {
    feed: any[];
    events: any[];
    community: any[];
  };
}

const initialState: OfflineState = {
  isOnline: true,
  pendingActions: [],
  syncing: false,
  lastSync: null,
  cache: {
    feed: [],
    events: [],
    community: [],
  },
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addPendingAction: (state, action: PayloadAction<OfflineAction>) => {
      state.pendingActions.push(action.payload);
    },
    removePendingAction: (state, action: PayloadAction<string>) => {
      state.pendingActions = state.pendingActions.filter(
        action => action.id !== action.payload
      );
    },
    updatePendingAction: (state, action: PayloadAction<{id: string; retryCount: number}>) => {
      const pendingAction = state.pendingActions.find(
        action => action.id === action.payload.id
      );
      if (pendingAction) {
        pendingAction.retryCount = action.payload.retryCount;
      }
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    setLastSync: (state, action: PayloadAction<string>) => {
      state.lastSync = action.payload;
    },
    updateCache: (state, action: PayloadAction<{key: keyof OfflineState['cache']; data: any}>) => {
      state.cache[action.payload.key] = action.payload.data;
    },
    clearCache: (state) => {
      state.cache = {
        feed: [],
        events: [],
        community: [],
      };
    },
  },
});

export const {
  setOnlineStatus,
  addPendingAction,
  removePendingAction,
  updatePendingAction,
  setSyncing,
  setLastSync,
  updateCache,
  clearCache,
} = offlineSlice.actions;
export default offlineSlice.reducer;
