import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';

export interface FeedItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  publishedAt: string;
  category: string;
  location?: {
    city: string;
    country: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface FeedState {
  items: FeedItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  filters: {
    category: string;
    location: string;
    sortBy: 'latest' | 'popular' | 'trending';
  };
}

const initialState: FeedState = {
  items: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  filters: {
    category: 'all',
    location: 'all',
    sortBy: 'latest',
  },
};

export const fetchFeedItems = createAsyncThunk(
  'feed/fetchItems',
  async (page: number, {rejectWithValue}) => {
    try {
      // TODO: Implement API call
      const response = await fetch(`/api/feed?page=${page}`);
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FeedState['filters']>>) => {
      state.filters = {...state.filters, ...action.payload};
      state.currentPage = 1;
      state.items = [];
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.isLiked = !item.isLiked;
        item.likes += item.isLiked ? 1 : -1;
      }
    },
    clearFeed: (state) => {
      state.items = [];
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.items) {
          state.items = [...state.items, ...action.payload.items];
          state.hasMore = action.payload.hasMore;
          state.currentPage += 1;
        }
      })
      .addCase(fetchFeedItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {setFilters, toggleLike, clearFeed} = feedSlice.actions;
export default feedSlice.reducer;
