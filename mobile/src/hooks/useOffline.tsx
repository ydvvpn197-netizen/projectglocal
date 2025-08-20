import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

interface OfflineContextType {
  isOnline: boolean;
  pendingActions: any[];
  syncing: boolean;
  lastSync: string | null;
  cache: any;
  syncData: () => Promise<void>;
  addPendingAction: (action: any) => void;
  clearCache: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({children}) => {
  const {isOnline, pendingActions, syncing, lastSync, cache} = useSelector(
    (state: RootState) => state.offline,
  );

  const syncData = async () => {
    // Implementation would handle data synchronization
  };

  const addPendingAction = (action: any) => {
    // Implementation would dispatch action
  };

  const clearCache = () => {
    // Implementation would dispatch action
  };

  const value: OfflineContextType = {
    isOnline,
    pendingActions,
    syncing,
    lastSync,
    cache,
    syncData,
    addPendingAction,
    clearCache,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
