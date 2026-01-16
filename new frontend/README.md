# ROSAgo - School Bus Theme Edition

**PRODUCTION UI EXPORT — NO BACKEND LOGIC**

ROSAgo is a fun, vibrant school-transport mobile application built with React Native (Expo SDK 53) featuring a playful School Bus design system with lots of bouncy animations, bright colors, and a joyful user experience inspired by classic yellow school buses.

## 🎨 Design System - School Bus Theme

### Color Palette
The app features a bold, cheerful color scheme inspired by iconic school buses:

- **Primary Colors**:
  - Bright Yellow (#FFD400) - Classic school bus yellow
  - Dark Yellow (#F5BE00) - Deeper yellow for depth
  - Black (#1A1A1A) - Bus body black for contrast

- **Accent Colors**:
  - Safety Orange (#FF6B35) - Playful orange highlights
  - Chrome (#C0C0C0) - Metallic accents
  - Sky Blue (#118AB2) - Fun blue for variety

- **Status Colors**:
  - Success Green (#06D6A0) - Go signals
  - Warning Yellow (#FFD400) - Matches primary
  - Danger Red (#E63946) - Stop sign red
  - Info Blue (#118AB2) - Informational

- **Neutrals**:
  - Warm Cream (#FFF8E7) - Soft background
  - Black (#1A1A1A) - Text and borders
  - Grays for secondary text

### Fun Glass Components
The app features playful glassmorphism UI with yellow tints:
- Yellow-tinted glass overlays (10-25% opacity)
- Bold 2-3px black borders for definition
- Bright gradient highlights
- Exaggerated shadows for depth
- Rounded corners (24px) for friendliness

### Bouncy Animations
Every interaction is fun and playful:
- **Spring-based press animations** - Buttons bounce and rotate slightly on press
- **Staggered entrance animations** - Cards fade in with springy delays
- **Overshoot effects** - Elements bounce past their target before settling
- **Micro-interactions** - Everything responds to touch with personality
- High damping values (8-15) for extra bounciness

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run on iOS
bun ios

# Run on Android
bun android

# Run on web
bun web
```

### Demo Login
The app includes 4 demo roles you can test:
1. **Parent** - Track children, view routes, manage payments
2. **Driver** - Manage trips, track attendance, communicate with parents
3. **Company Admin** - Manage drivers, buses, and routes
4. **Platform Admin** - Oversee all companies, schools, and analytics

## 📁 Project Structure

```
/home/user/workspace/
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable UI components (LiquidGlassCard, LargeCTAButton)
│   │   └── shared/           # Shared business components (ChildTile, ETAChip, etc.)
│   ├── screens/
│   │   ├── auth/            # Authentication screens
│   │   ├── parent/          # Parent flow screens
│   │   ├── driver/          # Driver flow screens
│   │   ├── company-admin/   # Company admin screens
│   │   └── platform-admin/  # Platform admin screens
│   ├── navigation/          # Navigation structure for all roles
│   ├── theme/               # Color palette, spacing tokens
│   ├── types/               # TypeScript type definitions
│   ├── state/               # Zustand stores (auth, etc.)
│   ├── mock/                # Mock data for demo
│   └── utils/               # Utilities (gpsMock, cn helper)
├── assets/                  # Images and Lottie animations
├── App.tsx                  # Main entry point
└── package.json
```

## 🎯 Features Implemented

### ✅ Core Infrastructure
- [x] Theme system with ROSAgo color palette
- [x] TypeScript types for all data models
- [x] Mock data for all user roles
- [x] GPS mock engine for live tracking simulation
- [x] Zustand state management with AsyncStorage persistence
- [x] Attendance tracking system for drivers with real-time stats

### ✅ UI Components
- [x] LiquidGlassCard with configurable intensity and yellow glass tint
- [x] LargeCTAButton with spring animations and solid styling
- [x] GlowingOrb with animated floating effects and high visibility
- [x] BusLoader with realistic animated school bus on moving road
- [x] ChildTile with status indicators (using initials instead of images)
- [x] DriverInfoBanner with call action
- [x] ETAChip with variants
- [x] NotificationItem with timestamps
- [x] PaymentCard for method selection
- [x] Interactive map markers with custom styling for bus, children, and stops
- [x] Filter chips with active states for child and notification filtering

### ✅ Navigation
- [x] Role-based navigation (Parent, Driver, Company Admin, Platform Admin)
- [x] Bottom tabs for Parent navigation
- [x] Native stack navigators with modal presentations
- [x] Demo login with role selection

### ✅ Screens

#### Parent Flow
- [x] ParentHomeScreen - Dashboard with children, driver info, quick actions, animated glowing orbs in header
- [x] LiveTrackingScreen - Real-time map tracking with bus location, child pickup points, ETA display, and driver contact
- [x] NotificationsScreen - Notification feed with filters (All, Pickup, Dropoff, Delay, Payment), mark as read, and pull-to-refresh
- [x] SettingsScreen - Profile management, notification preferences, privacy & security settings, support options
- [x] AddChildScreen - Complete child registration form with:
  - Basic information (name, DOB, grade, school)
  - Medical information (allergies, medical notes)
  - Emergency contact details with validation
  - **Pickup type selection:**
    - **Home Pickup**: Bus comes directly to home address
    - **Road Side Pickup**: Child waits along a named road, location-based expected spot determination
  - School/dropoff address
  - Form validation and success confirmation
- [x] EditProfileScreen - Edit parent profile (name, email, phone)
- [x] ManageChildrenScreen - View and manage all registered children
- [x] PrivacySettingsScreen - Privacy toggles and data management
- [x] ChangePasswordScreen - Secure password change with validation
- [x] HelpSupportScreen - Contact support, FAQ, emergency contacts
- [x] TermsPrivacyScreen - Full terms of service and privacy policy
- [x] PaymentsScreen (placeholder)
- [x] ReceiptHistoryScreen (placeholder)

#### Driver Flow
- [x] DriverHomeScreen - Dashboard with trip overview, quick actions, and animated glowing orbs in header
- [x] AttendanceScreen - Real-time attendance summary with pickup/dropoff stats, progress tracking, and animated glowing orbs
- [x] ChildListScreen - Filterable child list with pickup/dropoff actions (filter by All, Waiting, Picked Up, Dropped Off)
- [x] RouteMapScreen - Interactive map with route visualization, stop markers, and native Maps app navigation
- [x] BroadcastMessageScreen - Send messages to all or select parents with quick message templates and recipient selection
- [x] DriverSettingsScreen - Profile (read-only, admin-managed), trip settings, notifications, and account management
- [x] PrivacySecurityScreen - Privacy toggles, biometric login, password change, data management
- [x] HelpSupportScreen - Contact support (call, email, WhatsApp), FAQ section, emergency contacts

#### Admin Flows
- [x] Company Admin screens (Dashboard, Drivers, Buses, Children, Settings)
- [x] Platform Admin screens (Dashboard, Companies, Schools, Settings)

### ✅ Animations
- [x] React Native Reanimated 3 with bouncy spring animations throughout
- [x] Exaggerated spring-based button press with rotation effects (maximum solidity)
- [x] Staggered entrance animations with springify
- [x] Animated glowing orbs floating in header backgrounds (high visibility with pulsing opacity)
- [x] Professional animated school bus loader for loading states
- [x] Realistic bus moving horizontally on animated road with lane markings
- [x] Rotating wheels with spokes for realistic motion
- [x] All interactive elements have satisfying micro-animations
- [x] Consistent yellow-to-orange gradient backgrounds across all screens

## 🔌 Backend Integration Guide

This is a **UI-ONLY** project. All data currently uses mock data located in `src/mock/data.ts`.

### API Integration Points

Throughout the codebase, you'll find clearly marked TODO comments indicating where to integrate backend APIs:

```typescript
// Example from ParentHomeScreen.tsx
// TODO: Replace with actual API call to fetch parent's children
const children = mockChildren.filter((c) => c.parentId === user?.id);
```

### Required API Endpoints

#### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout

#### Parent Endpoints
- `GET /parents/:id/children` - Fetch parent's children
- `GET /children/:id` - Fetch child details
- `POST /children` - Add new child
- `PUT /children/:id` - Update child
- `DELETE /children/:id` - Remove child

#### Trip & Tracking
- `GET /trips/active` - Get active trips
- `GET /trips/:id/location` - Get real-time bus location (WebSocket recommended)
- `GET /routes/:id` - Get route details

#### Payments
- `POST /payments` - Create payment
- `GET /payments/:parentId` - Get payment history
- `GET /receipts/:parentId` - Get receipts

#### Notifications
- `GET /notifications/:userId` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read

#### Driver Endpoints
- `GET /drivers/:id/trips` - Get driver's trips
- `POST /trips/:id/attendance` - Mark child attendance (pickup/dropoff)
- `GET /trips/:id/attendance` - Get attendance records for a trip
- `POST /messages/broadcast` - Send broadcast message to specific parents or all parents
- `GET /routes/:id` - Get route details with stops and coordinates
- `PUT /drivers/:id/settings` - Update driver settings (managed by admin)
- `GET /trips/:id/children` - Get children grouped by parent for broadcast selection

#### Admin Endpoints
- `GET /companies/:id` - Company details
- `GET /companies/:id/drivers` - List drivers
- `GET /companies/:id/buses` - List buses
- `POST /buses` - Add bus
- PUT /buses/:id` - Update bus

### WebSocket Integration (Recommended)

For real-time features, implement WebSocket connections:

```typescript
// Example: Live GPS tracking
const socket = new WebSocket('wss://your-api.com/tracking');
socket.on('location-update', (location) => {
  // Update bus location on map
});
```

Replace the GPS mock engine (`src/utils/gpsMock.ts`) with actual WebSocket location updates.

## 📦 Export Instructions

This project is export-ready for your development team:

### Option 1: Direct Download
The project can be downloaded as-is from the Vibecode environment.

### Option 2: Git Repository
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial ROSAgo UI export"

# Push to your repository
git remote add origin <your-repo-url>
git push -u origin main
```

### Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Configure EAS in eas.json before building
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Mapbox (for maps)
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# API Base URL
EXPO_PUBLIC_API_URL=https://your-api.com

# Optional: Analytics
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 🛠️ Technologies Used

- **React Native**: 0.76.7
- **Expo SDK**: 53
- **TypeScript**: 5.8.3
- **React Navigation**: 7.x (Native Stack, Bottom Tabs)
- **React Native Reanimated**: 3.17.4
- **Zustand**: 5.0.4 (State Management)
  - Auth state with persistence
  - Attendance tracking for drivers
- **NativeWind**: 4.1.23 (Tailwind CSS for RN)
- **Expo Linear Gradient**: 14.1.4
- **Expo Blur**: 14.1.4
- **React Native Maps**: 1.24.3
- **Lottie React Native**: 7.2.2

## 📱 Screen Compatibility

Layouts are optimized for:
- iPhone SE, iPhone 12/13/14
- Mid-range Android devices
- Large Android devices

## ⚠️ Important Notes

1. **This is UI-only**: No backend logic is included. All API calls must be implemented.
2. **Mock Data**: Located in `src/mock/data.ts` - replace with real API calls.
3. **No Authentication**: Demo login only - implement real authentication.
4. **No Payment Processing**: UI only - integrate payment gateway (MoMo, etc.).
5. **No Push Notifications**: UI ready - implement push notification service.
6. **Maps**: Uses `react-native-maps` - configure Mapbox or Google Maps API.

## 🎨 Design Philosophy

ROSAgo's School Bus Theme embraces joy and playfulness while maintaining functionality:
- **Bold, cheerful aesthetic** - Bright yellow and black create instant recognition
- **Fun animations everywhere** - Every tap, scroll, and transition delights
- **60fps spring animations** - Using Reanimated 3 for butter-smooth interactions
- **Mobile-first and touch-optimized** - Large hit targets, satisfying feedback
- **High contrast** - Yellow and black ensure excellent readability
- **Personality in every detail** - From bouncy buttons to playful cards
- **Nostalgic warmth** - Evokes the familiar, trusted feeling of school buses

## 📄 License

This is a production-ready UI export. Integration with backend services is required.

## 🤝 Next Steps

1. **Set up backend**: Implement the API endpoints listed above
2. **Configure maps**: Add Mapbox or Google Maps API key
3. **Integrate payments**: Connect to mobile money or payment gateway
4. **Add push notifications**: Implement Firebase or OneSignal
5. **Test**: Thoroughly test all user flows with real data
6. **Deploy**: Build and submit to App Store / Play Store

---

**Generated with ROSAgo UI Builder**
Premium School Transport Solution
