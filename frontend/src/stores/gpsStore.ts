import { create } from 'zustand';
import { GPSLocation } from '../services/gpsService';

interface GPSStore {
  isTracking: boolean;
  currentLocation: GPSLocation | null;
  error: string | null;
  setTracking: (tracking: boolean) => void;
  setLocation: (location: GPSLocation) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGPSStore = create<GPSStore>((set) => ({
  isTracking: false,
  currentLocation: null,
  error: null,

  setTracking: (tracking: boolean) => set({ isTracking: tracking }),
  setLocation: (location: GPSLocation) => set({ currentLocation: location }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ isTracking: false, currentLocation: null, error: null }),
}));
