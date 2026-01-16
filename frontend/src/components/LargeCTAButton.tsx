/**
 * LargeCTAButton Component - School Bus Edition
 * Fun, bouncy action button with exaggerated spring animations
 */

import React from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '../theme';
import { cn } from '../utils/helpers';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LargeCTAButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export const LargeCTAButton: React.FC<LargeCTAButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className,
  style,
}) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {
      damping: 10,
      stiffness: 200,
    });
    rotate.value = withSpring(-2, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    rotate.value = withSequence(
      withSpring(2, { damping: 8 }),
      withSpring(0, { damping: 12 })
    );
  };

  const backgroundColor = {
    primary: colors.primary.yellow,
    secondary: colors.accent.skyBlue,
    success: colors.status.success,
    danger: colors.status.danger,
  }[variant];

  const textColor = variant === 'primary' ? colors.primary.black : colors.neutral.pureWhite;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor },
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      className={cn("rounded-xl", className)}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    minHeight: 60,
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    opacity: 0.4,
  },
});
