/**
 * Mock Data for ROSAgo
 * Realistic dummy data for development and demo purposes
 * TODO: Replace with actual API calls to backend endpoints
 */

import {
  Parent,
  Driver,
  Child,
  School,
  Bus,
  Route,
  Trip,
  Payment,
  Receipt,
  Notification,
  Company,
  RouteStop,
} from "../types/models";

// Mock Schools
export const mockSchools: School[] = [
  {
    id: "school-1",
    name: "Greenfield Academy",
    location: {
      latitude: 5.6037,
      longitude: -0.187,
      address: "123 Independence Ave, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-2",
    name: "Sunrise International School",
    location: {
      latitude: 5.6145,
      longitude: -0.205,
      address: "45 Ring Road, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-3",
    name: "Tema International School",
    location: {
      latitude: 5.6695,
      longitude: 0.0183,
      address: "Liberation Road, Tema",
    },
    companyId: "company-1",
  },
  {
    id: "school-4",
    name: "Lincoln Community School",
    location: {
      latitude: 5.6471,
      longitude: -0.1712,
      address: "Nii Saban Street, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-5",
    name: "British International School",
    location: {
      latitude: 5.5951,
      longitude: -0.2195,
      address: "Cantonments, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-6",
    name: "Accra Academy",
    location: {
      latitude: 5.6311,
      longitude: -0.2041,
      address: "Bubuashie Highway, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-7",
    name: "Galaxy International School",
    location: {
      latitude: 5.5889,
      longitude: -0.2471,
      address: "West Legon, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-8",
    name: "St. Mary's Senior High School",
    location: {
      latitude: 5.6507,
      longitude: -0.1625,
      address: "Asylum Down, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-9",
    name: "Ridge Church School",
    location: {
      latitude: 5.5801,
      longitude: -0.2013,
      address: "Ridge Road, Accra",
    },
    companyId: "company-1",
  },
  {
    id: "school-10",
    name: "Morning Star International School",
    location: {
      latitude: 5.6228,
      longitude: -0.1797,
      address: "Dzorwulu, Accra",
    },
    companyId: "company-1",
  },
];

// Mock Companies
export const mockCompanies: Company[] = [
  {
    id: "company-1",
    name: "SafeRide Transport Ltd",
    adminIds: ["admin-1"],
    busIds: ["bus-1", "bus-2"],
    driverIds: ["driver-1", "driver-2"],
  },
];

// Mock Parent
export const mockParent: Parent = {
  id: "parent-1",
  name: "Ama Mensah",
  email: "ama.mensah@example.com",
  phone: "+233 20 123 4567",
  role: "parent",
  children: ["child-1", "child-2"],
};

// Mock Driver
export const mockDriver: Driver = {
  id: "driver-1",
  name: "Kwame Osei",
  email: "kwame.osei@example.com",
  phone: "+233 24 987 6543",
  role: "driver",
  licenseNumber: "DL-2023-1234",
  busId: "bus-1",
  avatar: "https://i.pravatar.cc/150?img=12",
};

// Mock Children
export const mockChildren: Child[] = [
  {
    id: "child-1",
    name: "Akosua Mensah",
    parentId: "parent-1",
    schoolId: "school-1",
    pickupType: "home",
    pickupLocation: {
      latitude: 5.5965,
      longitude: -0.175,
      address: "12 Oxford Street, Osu, Accra",
    },
    dropoffLocation: {
      latitude: 5.6037,
      longitude: -0.187,
      address: "123 Independence Ave, Accra",
    },
    status: "waiting",
    busId: "bus-1",
    routeId: "route-1",
    avatar: "https://i.pravatar.cc/150?img=25",
  },
  {
    id: "child-2",
    name: "Kwabena Mensah",
    parentId: "parent-1",
    schoolId: "school-1",
    pickupType: "home",
    pickupLocation: {
      latitude: 5.5965,
      longitude: -0.175,
      address: "12 Oxford Street, Osu, Accra",
    },
    dropoffLocation: {
      latitude: 5.6037,
      longitude: -0.187,
      address: "123 Independence Ave, Accra",
    },
    status: "waiting",
    busId: "bus-1",
    routeId: "route-1",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "child-3",
    name: "Yaa Asante",
    parentId: "parent-2",
    schoolId: "school-2",
    pickupType: "roadside",
    pickupLocation: {
      latitude: 5.6015,
      longitude: -0.182,
      address: "Cantonments Road Junction",
    },
    dropoffLocation: {
      latitude: 5.6145,
      longitude: -0.205,
      address: "45 Ring Road, Accra",
    },
    status: "picked_up",
    busId: "bus-1",
    routeId: "route-1",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
];

// Mock Buses
export const mockBuses: Bus[] = [
  {
    id: "bus-1",
    plateNumber: "GR-2023-456",
    capacity: 25,
    driverId: "driver-1",
    routeId: "route-1",
    currentLocation: {
      latitude: 5.5985,
      longitude: -0.178,
    },
    companyId: "company-1",
  },
  {
    id: "bus-2",
    plateNumber: "GR-2023-789",
    capacity: 30,
    driverId: "driver-2",
    companyId: "company-1",
  },
];

// Mock Route Stops
const mockRouteStops: RouteStop[] = [
  {
    id: "stop-1",
    location: {
      latitude: 5.5965,
      longitude: -0.175,
      address: "12 Oxford Street, Osu, Accra",
    },
    order: 1,
    childIds: ["child-1", "child-2"],
    estimatedArrivalTime: "07:15 AM",
  },
  {
    id: "stop-2",
    location: {
      latitude: 5.6015,
      longitude: -0.182,
      address: "Cantonments Road Junction",
    },
    order: 2,
    childIds: ["child-3"],
    estimatedArrivalTime: "07:25 AM",
  },
  {
    id: "stop-3",
    location: {
      latitude: 5.6037,
      longitude: -0.187,
      address: "123 Independence Ave, Accra",
    },
    order: 3,
    childIds: ["child-1", "child-2"],
    estimatedArrivalTime: "07:40 AM",
  },
];

// Mock Routes
export const mockRoutes: Route[] = [
  {
    id: "route-1",
    name: "Osu - Greenfield Route",
    busId: "bus-1",
    stops: mockRouteStops,
    companyId: "company-1",
  },
];

// Mock Trip
export const mockTrip: Trip = {
  id: "trip-1",
  routeId: "route-1",
  busId: "bus-1",
  driverId: "driver-1",
  date: new Date().toISOString(),
  status: "in_progress",
  startTime: "07:00 AM",
  childIds: ["child-1", "child-2", "child-3"],
  currentLocation: {
    latitude: 5.5985,
    longitude: -0.178,
  },
};

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: "payment-1",
    parentId: "parent-1",
    childId: "child-1",
    amount: 150,
    method: "momo",
    frequency: "weekly",
    date: new Date().toISOString(),
    status: "completed",
  },
  {
    id: "payment-2",
    parentId: "parent-1",
    childId: "child-2",
    amount: 150,
    method: "momo",
    frequency: "weekly",
    date: new Date().toISOString(),
    status: "completed",
  },
];

// Mock Receipts
export const mockReceipts: Receipt[] = [
  {
    id: "receipt-1",
    paymentId: "payment-1",
    parentId: "parent-1",
    amount: 150,
    date: new Date().toISOString(),
    method: "momo",
  },
  {
    id: "receipt-2",
    paymentId: "payment-2",
    parentId: "parent-1",
    amount: 150,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    method: "cash",
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "parent-1",
    type: "pickup",
    title: "Child Picked Up",
    message: "Akosua has been picked up at 07:15 AM",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "notif-2",
    userId: "parent-1",
    type: "delay",
    title: "Slight Delay",
    message: "Bus running 5 minutes late due to traffic",
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-3",
    userId: "parent-1",
    type: "drop",
    title: "Child Dropped Off",
    message: "Akosua arrived at school at 07:40 AM",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// GPS Mock Route for Live Tracking
export const mockGPSRoute = [
  { latitude: 5.5965, longitude: -0.175 },
  { latitude: 5.5975, longitude: -0.176 },
  { latitude: 5.5985, longitude: -0.178 },
  { latitude: 5.5995, longitude: -0.179 },
  { latitude: 5.6005, longitude: -0.180 },
  { latitude: 5.6015, longitude: -0.182 },
  { latitude: 5.6025, longitude: -0.184 },
  { latitude: 5.6037, longitude: -0.187 },
];
