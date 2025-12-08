// Core Types
export type UserRole = 'parent' | 'driver' | 'company_admin' | 'platform_admin';
export type ChildStatus = 'waiting' | 'picked_up' | 'on_board' | 'dropped_off' | 'absent';
export type PickupType = 'HOME' | 'ROADSIDE' | 'SCHOOL';
export type NotificationType = 'PICKUP' | 'DROPOFF' | 'DELAY' | 'PAYMENT' | 'INFO';

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
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  schoolId: string;
  school?: { id: string; name: string };
  parentId: string;
  status?: ChildStatus;
  pickupType: PickupType;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupDescription?: string;
  image?: string;
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
  route?: { id: string; name: string } | string;
  bus?: { id: string; plateNumber: string; driver?: { user?: { firstName: string; lastName: string } } };
  driverId?: string;
  busId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  totalChildren?: number;
  pickedUp?: number;
  droppedOff?: number;
  absent?: number;
  attendances?: Array<{ status: 'PICKED_UP' | 'DROPPED_OFF' | 'ABSENT' | 'WAITING' }>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'ARRIVED_SCHOOL' | 'RETURN_IN_PROGRESS' | 'COMPLETED';
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
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
