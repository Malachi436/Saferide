# ROSAgo Frontend

School transport management application built with Expo SDK 54 and React Native.

## Tech Stack

- **Expo SDK**: 54.0.0
- **React Native**: 0.81.0
- **Navigation**: React Navigation 7
- **State Management**: Zustand with AsyncStorage
- **Styling**: NativeWind v4 (Tailwind CSS)
- **Maps**: react-native-maps
- **Icons**: lucide-react-native

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   ├── stores/           # Zustand state stores
│   ├── theme/            # Design system constants
│   ├── types.ts          # TypeScript types
│   └── utils/            # Helper functions
├── assets/               # Images and static files
├── App.tsx               # Main app component
└── index.ts              # Entry point
```

## Features

### Parent Portal
- View children's status
- Track bus location in real-time
- Receive notifications
- Make payments via MoMo Hubtle
- Add and manage children

### Driver Portal
- Mark student attendance
- View route map
- Send broadcast messages to parents
- Track trip statistics

## Design System

The app uses a "Liquid Glass" design language:
- **Background**: Cream/Off-white (#FDFDFD)
- **Cards**: White with transparency (90%)
- **Primary Color**: Blue (#3B82F6)
- **Status Colors**: Green (success), Orange (warning), Red (danger)

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm test` - Run tests
