/**
 * GlowingOrb Component - Enhanced Visibility
 * Bright, glowing orbs that float slowly across the screen
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface GlowingOrbProps {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
  startX?: number;
  startY?: number;
}

export function GlowingOrb({
  size = 120,
  color = "rgba(255, 255, 255, 0.3)",
  delay = 0,
  duration = 8000,
  startX = 0,
  startY = 0,
}: GlowingOrbProps) {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    // Horizontal movement
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 50, {
            duration: duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(startX - 30, {
            duration: duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(startX, {
            duration: duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );

    // Vertical movement
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startY - 20, {
            duration: duration * 0.8,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(startY + 40, {
            duration: duration * 1.2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(startY, {
            duration: duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );

    // Pulsing scale
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Opacity pulsing - much more visible
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [delay, duration, startX, startY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    >
      {/* Outer glow ring */}
      <View style={[styles.glowRing, {
        width: size,
        height: size,
        borderRadius: size / 2,
      }]} />

      {/* Main gradient orb */}
      <LinearGradient
        colors={[color, "rgba(255, 255, 255, 0.3)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
    </Animated.View>
  );
}

// Helper function to replace withDelay (not available in reanimated)
function withDelay(delay: number, animation: any) {
  return withSequence(withTiming(0, { duration: delay }), animation);
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    shadowColor: "#FFD400",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 10,
  },
  glowRing: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 8,
  },
});
