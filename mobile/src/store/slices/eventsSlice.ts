import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  image?: string;
  attendees: number;
  maxAttendees?: number;
  isAttending: boolean;
  price?: number;
}

export interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    date: string;
    location: string;
  };
}

const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    date: 'all',
    location: 'all',
  },
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    toggleAttendance: (state, action: PayloadAction<string>) => {
      const event = state.events.find(e => e.id === action.payload);
      if (event) {
        event.isAttending = !event.isAttending;
        event.attendees += event.isAttending ? 1 : -1;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<EventsState['filters']>>) => {
      state.filters = {...state.filters, ...action.payload};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setEvents, toggleAttendance, setFilters, setLoading, setError} = eventsSlice.actions;
export default eventsSlice.reducer;
