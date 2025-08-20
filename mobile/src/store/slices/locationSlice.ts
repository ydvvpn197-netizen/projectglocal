import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {locationService} from '../../services/locationService';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region?: string;
  timezone?: string;
}

export interface LocationState {
  currentLocation: Location | null;
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  isLocationEnabled: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  selectedLocation: null,
  isLoading: false,
  error: null,
  hasPermission: false,
  isLocationEnabled: false,
};

// Async thunks
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, {rejectWithValue}) => {
    try {
      const location = await locationService.getCurrentLocation();
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestLocationPermission = createAsyncThunk(
  'location/requestPermission',
  async (_, {rejectWithValue}) => {
    try {
      const hasPermission = await locationService.requestPermission();
      return hasPermission;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateLocation = createAsyncThunk(
  'location/updateLocation',
  async (location: Location, {rejectWithValue}) => {
    try {
      await locationService.updateLocation(location);
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    setSelectedLocation: (state, action: PayloadAction<Location>) => {
      state.selectedLocation = action.payload;
    },
    setLocationPermission: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current location
      .addCase(getCurrentLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLocation = action.payload;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Request permission
      .addCase(requestLocationPermission.fulfilled, (state, action) => {
        state.hasPermission = action.payload;
      })
      .addCase(requestLocationPermission.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update location
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.selectedLocation = action.payload;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentLocation,
  setSelectedLocation,
  setLocationPermission,
  setLocationEnabled,
  clearLocationError,
} = locationSlice.actions;
export default locationSlice.reducer;
