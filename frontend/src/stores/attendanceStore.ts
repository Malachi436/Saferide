import { create } from 'zustand';
import { Child, ChildStatus, Trip, AddChildData } from '../types';

interface AttendanceState {
  children: Child[];
  activeTrip: Trip | null;
  isLoading: boolean;

  // Actions
  toggleChildStatus: (childId: string) => void;
  setChildren: (children: Child[]) => void;
  addChild: (childData: AddChildData, parentId: string) => void;
  removeChild: (childId: string) => void;
  setActiveTrip: (trip: Trip | null) => void;
  loadMockData: () => void;
}

// Helper function to cycle through statuses
const getNextStatus = (currentStatus: ChildStatus): ChildStatus => {
  const statusCycle: ChildStatus[] = ['waiting', 'picked_up', 'dropped_off', 'absent'];
  const currentIndex = statusCycle.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % statusCycle.length;
  return statusCycle[nextIndex];
};

export const useAttendanceStore = create<AttendanceState>((set) => ({
  children: [],
  activeTrip: null,
  isLoading: false,

  toggleChildStatus: (childId: string) => {
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId
          ? { ...child, status: getNextStatus(child.status) }
          : child
      ),
    }));

    // Update trip stats
    set((state) => {
      if (!state.activeTrip) return state;

      const pickedUp = state.children.filter(c => c.status === 'picked_up' || c.status === 'on_board').length;
      const droppedOff = state.children.filter(c => c.status === 'dropped_off').length;
      const absent = state.children.filter(c => c.status === 'absent').length;

      return {
        activeTrip: {
          ...state.activeTrip,
          pickedUp,
          droppedOff,
          absent,
        },
      };
    });
  },

  setChildren: (children: Child[]) => {
    set({ children });
  },

  addChild: (childData: AddChildData, parentId: string) => {
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      ...childData,
      status: 'waiting',
      parentId,
      image: `https://i.pravatar.cc/150?u=${Math.random()}`,
    };

    set((state) => ({
      children: [...state.children, newChild],
    }));
  },

  removeChild: (childId: string) => {
    set((state) => ({
      children: state.children.filter((child) => child.id !== childId),
    }));
  },

  setActiveTrip: (trip: Trip | null) => {
    set({ activeTrip: trip });
  },

  loadMockData: () => {
    const mockChildren: Child[] = [
      {
        id: '1',
        name: 'Emma Johnson',
        school: 'Springfield Elementary',
        grade: '3rd Grade',
        status: 'waiting',
        pickupType: 'home',
        pickupLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St',
        },
        image: 'https://i.pravatar.cc/150?u=emma',
        parentId: 'parent1',
      },
      {
        id: '2',
        name: 'Liam Smith',
        school: 'Springfield Elementary',
        grade: '5th Grade',
        status: 'waiting',
        pickupType: 'roadside',
        pickupLocation: {
          latitude: 37.7849,
          longitude: -122.4294,
          roadName: 'Oak Avenue',
        },
        image: 'https://i.pravatar.cc/150?u=liam',
        parentId: 'parent1',
      },
      {
        id: '3',
        name: 'Olivia Davis',
        school: 'Springfield Elementary',
        grade: '4th Grade',
        status: 'picked_up',
        pickupType: 'home',
        pickupLocation: {
          latitude: 37.7649,
          longitude: -122.4094,
          address: '456 Elm St',
        },
        image: 'https://i.pravatar.cc/150?u=olivia',
        parentId: 'parent2',
      },
      {
        id: '4',
        name: 'Noah Wilson',
        school: 'Springfield Elementary',
        grade: '2nd Grade',
        status: 'on_board',
        pickupType: 'home',
        pickupLocation: {
          latitude: 37.7549,
          longitude: -122.3994,
          address: '789 Pine St',
        },
        image: 'https://i.pravatar.cc/150?u=noah',
        parentId: 'parent3',
      },
    ];

    const mockTrip: Trip = {
      id: 'trip1',
      route: 'Route A - Morning',
      driverId: 'driver1',
      busId: 'bus1',
      date: new Date().toISOString().split('T')[0],
      startTime: '07:00',
      totalChildren: 4,
      pickedUp: 2,
      droppedOff: 0,
      absent: 0,
      status: 'active',
    };

    set({ children: mockChildren, activeTrip: mockTrip });
  },
}));
