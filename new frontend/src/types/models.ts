/**
 * ROSAgo Data Models
 * TypeScript type definitions for all app entities
 */

export type UserRole = "parent" | "driver";

export type PickupType = "home" | "roadside";

export type TripStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type ChildStatus = "waiting" | "picked_up" | "on_way" | "arrived" | "dropped_off";

export type PaymentMethod = "momo" | "cash";

export type PaymentFrequency = "daily" | "weekly" | "monthly";

export type NotificationType = "pickup" | "drop" | "delay" | "payment" | "general";

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export interface Parent extends User {
  role: "parent";
  children: string[]; // child IDs
}

export interface Driver extends User {
  role: "driver";
  licenseNumber: string;
  busId?: string;
}

export interface Child {
  id: string;
  name: string;
  parentId: string;
  schoolId: string;
  pickupType: PickupType;
  pickupLocation: Location;
  dropoffLocation: Location;
  avatar?: string;
  status: ChildStatus;
  busId?: string;
  routeId?: string;
}

export interface School {
  id: string;
  name: string;
  location: Location;
  companyId?: string;
}

export interface Bus {
  id: string;
  plateNumber: string;
  capacity: number;
  driverId?: string;
  routeId?: string;
  currentLocation?: Location;
  companyId: string;
}

export interface Route {
  id: string;
  name: string;
  busId: string;
  stops: RouteStop[];
  companyId: string;
}

export interface RouteStop {
  id: string;
  location: Location;
  order: number;
  childIds: string[];
  estimatedArrivalTime?: string;
  actualArrivalTime?: string;
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  date: string;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  childIds: string[];
  currentLocation?: Location;
}

export interface Payment {
  id: string;
  parentId: string;
  childId: string;
  amount: number;
  method: PaymentMethod;
  frequency: PaymentFrequency;
  date: string;
  status: "pending" | "completed" | "failed";
}

export interface Receipt {
  id: string;
  paymentId: string;
  parentId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Company {
  id: string;
  name: string;
  adminIds: string[];
  busIds: string[];
  driverIds: string[];
}

export interface BroadcastMessage {
  id: string;
  driverId: string;
  message: string;
  timestamp: string;
  parentIds: string[];
}
