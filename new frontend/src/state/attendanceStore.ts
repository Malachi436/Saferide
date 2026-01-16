/**
 * Attendance Store
 * Manages child attendance tracking for drivers
 */

import { create } from "zustand";
import { ChildStatus } from "../types/models";

export interface AttendanceRecord {
  childId: string;
  status: ChildStatus;
  pickupTime?: string;
  dropoffTime?: string;
  notes?: string;
}

interface AttendanceState {
  // Map of tripId -> attendance records
  tripAttendance: Record<string, AttendanceRecord[]>;

  // Current trip ID
  currentTripId: string | null;

  // Actions
  setCurrentTrip: (tripId: string) => void;
  markPickedUp: (tripId: string, childId: string) => void;
  markDroppedOff: (tripId: string, childId: string) => void;
  updateAttendanceStatus: (tripId: string, childId: string, status: ChildStatus) => void;
  getAttendanceForTrip: (tripId: string) => AttendanceRecord[];
  getTripStats: (tripId: string, childIds: string[]) => {
    total: number;
    pickedUp: number;
    droppedOff: number;
    waiting: number;
  };
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  tripAttendance: {},
  currentTripId: null,

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  markPickedUp: (tripId, childId) => {
    const state = get();
    const tripRecords = state.tripAttendance[tripId] || [];
    const existingIndex = tripRecords.findIndex((r) => r.childId === childId);

    const updatedRecord: AttendanceRecord = {
      childId,
      status: "picked_up",
      pickupTime: new Date().toISOString(),
    };

    let updatedRecords: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...tripRecords];
      updatedRecords[existingIndex] = {
        ...tripRecords[existingIndex],
        ...updatedRecord,
      };
    } else {
      updatedRecords = [...tripRecords, updatedRecord];
    }

    set({
      tripAttendance: {
        ...state.tripAttendance,
        [tripId]: updatedRecords,
      },
    });
  },

  markDroppedOff: (tripId, childId) => {
    const state = get();
    const tripRecords = state.tripAttendance[tripId] || [];
    const existingIndex = tripRecords.findIndex((r) => r.childId === childId);

    const updatedRecord: AttendanceRecord = {
      childId,
      status: "dropped_off",
      dropoffTime: new Date().toISOString(),
    };

    let updatedRecords: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...tripRecords];
      updatedRecords[existingIndex] = {
        ...tripRecords[existingIndex],
        ...updatedRecord,
      };
    } else {
      updatedRecords = [...tripRecords, updatedRecord];
    }

    set({
      tripAttendance: {
        ...state.tripAttendance,
        [tripId]: updatedRecords,
      },
    });
  },

  updateAttendanceStatus: (tripId, childId, status) => {
    const state = get();
    const tripRecords = state.tripAttendance[tripId] || [];
    const existingIndex = tripRecords.findIndex((r) => r.childId === childId);

    const updatedRecord: AttendanceRecord = {
      childId,
      status,
    };

    let updatedRecords: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...tripRecords];
      updatedRecords[existingIndex] = {
        ...tripRecords[existingIndex],
        ...updatedRecord,
      };
    } else {
      updatedRecords = [...tripRecords, updatedRecord];
    }

    set({
      tripAttendance: {
        ...state.tripAttendance,
        [tripId]: updatedRecords,
      },
    });
  },

  getAttendanceForTrip: (tripId) => {
    const state = get();
    return state.tripAttendance[tripId] || [];
  },

  getTripStats: (tripId, childIds) => {
    const state = get();
    const attendance = state.tripAttendance[tripId] || [];

    const pickedUp = attendance.filter(
      (a) => childIds.includes(a.childId) &&
      (a.status === "picked_up" || a.status === "on_way" || a.status === "dropped_off")
    ).length;

    const droppedOff = attendance.filter(
      (a) => childIds.includes(a.childId) && a.status === "dropped_off"
    ).length;

    return {
      total: childIds.length,
      pickedUp,
      droppedOff,
      waiting: childIds.length - pickedUp,
    };
  },
}));
