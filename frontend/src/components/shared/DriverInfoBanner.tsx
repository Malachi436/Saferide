/**
 * DriverInfoBanner Component - School Bus Edition
 * Display driver information with bold styling and animations
 * CRITICAL: Bold borders, animated call button, strong visual hierarchy
 */

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Driver } from '../../types/models';
import { colors } from '../../theme';
import { LiquidCard } from '../LiquidCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DriverInfoBannerProps {
  driver: Driver;
  busPlateNumber?: string;
}

export function DriverInfoBanner({ driver, busPlateNumber }: DriverInfoBannerProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, {
      damping: 8,
      stiffness: 200,
    });
    rotate.value = withSpring(-5, { damping: 8 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.15, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    rotate.value = withSequence(
      withSpring(5, { damping: 6 }),
      withSpring(0, { damping: 10 })
    );
  };

  const handleCall = () => {
    // TODO: Implement phone call functionality
    console.log('Call driver:', driver.phone);
  };

  return (
    <LiquidCard intensity="heavy">
      <View style={styles.container}>
        {/* Avatar with bold border */}
        <View style={styles.avatarContainer}>
          {driver.avatar ? (
            <Image source={{ uri: driver.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color={colors.primary.black} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>YOUR DRIVER</Text>
          <Text style={styles.name}>{driver.name}</Text>
          {busPlateNumber && <Text style={styles.busNumber}>🚌 {busPlateNumber}</Text>}
        </View>

        {/* Animated Call button with bouncy feel */}
        <AnimatedPressable
          onPress={handleCall}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.callButton, animatedStyle]}
        >
          <Ionicons name="call" size={22} color={colors.neutral.pureWhite} />
        </AnimatedPressable>
      </View>
    </LiquidCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.primary.yellow,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    marginBottom: 3,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
    marginBottom: 3,
  },
  busNumber: {
    fontSize: 14,
    color: colors.primary.black,
    fontWeight: '700',
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
});
