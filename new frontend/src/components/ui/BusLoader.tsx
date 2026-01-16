/**
 * BusLoader Component - Realistic Version
 * Professional animated school bus for loading states
 */

import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme";

interface BusLoaderProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export function BusLoader({ message = "Loading...", size = "medium" }: BusLoaderProps) {
  const translateX = useSharedValue(-150);
  const wheelRotation = useSharedValue(0);
  const roadProgress = useSharedValue(0);

  const sizeConfig = {
    small: { bus: 80, height: 45, wheel: 14 },
    medium: { bus: 100, height: 56, wheel: 18 },
    large: { bus: 120, height: 67, wheel: 22 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Bus moving across screen - smooth continuous motion
    translateX.value = withRepeat(
      withSequence(
        withTiming(450, { duration: 3000, easing: Easing.linear }),
        withTiming(-150, { duration: 0 })
      ),
      -1,
      false
    );

    // Wheel rotation - synchronized with movement
    wheelRotation.value = withRepeat(
      withTiming(360, { duration: 600, easing: Easing.linear }),
      -1,
      false
    );

    // Road animation
    roadProgress.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const busAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const roadAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -roadProgress.value * 60 }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.scene}>
        {/* Animated Bus */}
        <Animated.View style={[styles.busContainer, busAnimatedStyle]}>
          {/* Bus Body */}
          <View style={[styles.busBody, { width: config.bus, height: config.height }]}>
            {/* Top Section - Windows */}
            <View style={styles.topSection}>
              <View style={styles.windowRow}>
                <View style={[styles.window, styles.frontWindow]} />
                <View style={styles.window} />
                <View style={styles.window} />
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>

            {/* Bottom Section - Yellow body */}
            <LinearGradient
              colors={[colors.primary.yellow, colors.primary.darkYellow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.bodyGradient}
            >
              {/* Black stripe */}
              <View style={styles.stripe} />

              {/* Side details */}
              <View style={styles.sidePanel}>
                <View style={styles.door} />
              </View>
            </LinearGradient>

            {/* Front bumper */}
            <View style={[styles.frontBumper, { height: config.height * 0.6 }]} />
          </View>

          {/* Wheels with realistic shadows */}
          <View style={[styles.wheelContainer, { bottom: -config.wheel * 0.3 }]}>
            <Animated.View
              style={[
                styles.wheel,
                {
                  width: config.wheel,
                  height: config.wheel,
                  borderRadius: config.wheel / 2,
                  left: config.bus * 0.25,
                },
                wheelAnimatedStyle,
              ]}
            >
              <View style={styles.wheelCenter} />
              <View style={[styles.wheelSpoke, { transform: [{ rotate: "0deg" }] }]} />
              <View style={[styles.wheelSpoke, { transform: [{ rotate: "90deg" }] }]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.wheel,
                {
                  width: config.wheel,
                  height: config.wheel,
                  borderRadius: config.wheel / 2,
                  right: config.bus * 0.15,
                },
                wheelAnimatedStyle,
              ]}
            >
              <View style={styles.wheelCenter} />
              <View style={[styles.wheelSpoke, { transform: [{ rotate: "0deg" }] }]} />
              <View style={[styles.wheelSpoke, { transform: [{ rotate: "90deg" }] }]} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Road */}
        <View style={styles.road}>
          <View style={styles.roadSurface} />
          <Animated.View style={[styles.roadMarkings, roadAnimatedStyle]}>
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
            <View style={styles.roadDash} />
          </Animated.View>
        </View>
      </View>

      {/* Loading message */}
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  scene: {
    width: "100%",
    height: 120,
    position: "relative",
    marginBottom: 20,
  },
  busContainer: {
    position: "absolute",
    top: 20,
    zIndex: 2,
  },
  busBody: {
    position: "relative",
    backgroundColor: colors.primary.yellow,
    borderRadius: 6,
    overflow: "visible",
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  topSection: {
    height: "40%",
    backgroundColor: colors.primary.black,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 6,
    paddingTop: 3,
  },
  windowRow: {
    flexDirection: "row",
    gap: 3,
    height: "100%",
  },
  window: {
    flex: 1,
    backgroundColor: colors.accent.skyBlue,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.primary.black,
  },
  frontWindow: {
    borderTopLeftRadius: 4,
  },
  bodyGradient: {
    height: "60%",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    position: "relative",
  },
  stripe: {
    position: "absolute",
    top: 6,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: colors.primary.black,
  },
  sidePanel: {
    position: "absolute",
    left: 8,
    top: 12,
    bottom: 4,
    width: 10,
  },
  door: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primary.black + "30",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.primary.black + "50",
  },
  frontBumper: {
    position: "absolute",
    left: -6,
    top: "20%",
    width: 6,
    backgroundColor: colors.accent.chrome,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.primary.black + "40",
  },
  wheelContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  wheel: {
    position: "absolute",
    backgroundColor: colors.primary.black,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelCenter: {
    width: "40%",
    height: "40%",
    backgroundColor: colors.neutral.gray,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.primary.black,
  },
  wheelSpoke: {
    position: "absolute",
    width: "80%",
    height: 2,
    backgroundColor: colors.neutral.gray,
  },
  road: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  roadSurface: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: colors.neutral.textSecondary,
    borderTopWidth: 2,
    borderTopColor: colors.primary.black,
  },
  roadMarkings: {
    position: "absolute",
    bottom: 12,
    left: 0,
    flexDirection: "row",
    gap: 40,
    width: "200%",
  },
  roadDash: {
    width: 30,
    height: 4,
    backgroundColor: colors.primary.yellow,
    borderRadius: 2,
  },
  message: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
