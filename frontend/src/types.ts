// Core Types
export type UserRole = 'parent' | 'driver';
export type ChildStatus = 'waiting' | 'picked_up' | 'on_board' | 'dropped_off' | 'absent';
export type PickupType = 'home' | 'roadside';
export type NotificationType = 'payment' | 'alert' | 'info' | 'delay';

// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Child
export interface Child {
  id: string;
  name: string;
  school: string;
  grade?: string;
  status: ChildStatus;
  pickupType: PickupType;
  pickupLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    roadName?: string;
  };
  image?: string;
  parentId: string;
}

export interface AddChildData {
  name: string;
  school: string;
  grade?: string;
  pickupType: PickupType;
  pickupLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    roadName?: string;
  };
}

// Trip
export interface Trip {
  id: string;
  route: string;
  driverId: string;
  busId: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalChildren: number;
  pickedUp: number;
  droppedOff: number;
  absent: number;
  status: 'pending' | 'active' | 'completed';
}

// Notifications
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
}

// Broadcast Message Templates
export type BroadcastTemplate = 
  | 'running_late' 
  | 'vehicle_issue' 
  | 'route_change' 
  | 'custom';

export interface BroadcastMessage {
  template: BroadcastTemplate;
  customMessage?: string;
  estimatedDelay?: number;
}

// Location
export interface Location {
  latitude: number;
  longitude: number;
}

export interface BusLocation extends Location {
  busId: string;
  heading?: number;
  speed?: number;
  timestamp: string;
}
