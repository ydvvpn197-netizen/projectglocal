import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isMember: boolean;
  image?: string;
  category: string;
  location?: {
    city: string;
    country: string;
  };
}

export interface CommunityState {
  groups: CommunityGroup[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  groups: [],
  isLoading: false,
  error: null,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<CommunityGroup[]>) => {
      state.groups = action.payload;
    },
    toggleMembership: (state, action: PayloadAction<string>) => {
      const group = state.groups.find(g => g.id === action.payload);
      if (group) {
        group.isMember = !group.isMember;
        group.memberCount += group.isMember ? 1 : -1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setGroups, toggleMembership, setLoading, setError} = communitySlice.actions;
export default communitySlice.reducer;
