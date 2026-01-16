/**
 * LargeCTAButton Component
 * Primary action button with press animations
 */

import React from "react";
import { Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LargeCTAButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function LargeCTAButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: LargeCTAButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = async () => {
    await onPress();
  };

  const backgroundColor = {
    primary: colors.primary.yellow,
    secondary: colors.accent.safetyOrange,
    success: colors.status.success,
    danger: colors.status.danger,
  }[variant];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: colors.neutral.pureWhite,
    fontSize: 18,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
