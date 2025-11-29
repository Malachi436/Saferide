import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { cn } from '../utils/helpers';

interface LiquidCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({ 
  children, 
  className,
  style,
  ...props 
}) => {
  return (
    <View 
      style={[styles.card, style]}
      className={cn("bg-white/90 rounded-2xl p-4 shadow-sm border border-white/50", className)}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
