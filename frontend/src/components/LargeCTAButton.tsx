import React from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { cn } from '../utils/helpers';

interface LargeCTAButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
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
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: '#3B82F6',
          text: '#FFFFFF',
        };
      case 'secondary':
        return {
          bg: '#F3F4F6',
          text: '#374151',
        };
      case 'danger':
        return {
          bg: '#EF4444',
          text: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyles.bg,
          opacity: pressed ? 0.8 : isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      className={cn("rounded-xl h-12", className)}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} />
      ) : (
        <Text style={[styles.text, { color: variantStyles.text }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
