import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChildStatus } from '../types';
import { statusColors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface StatusBadgeProps {
  status: ChildStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          label: 'Waiting',
          color: statusColors.waiting,
          bgColor: 'rgba(156, 163, 175, 0.1)',
          iconName: 'time-outline',
        };
      case 'picked_up':
        return {
          label: 'Picked Up',
          color: statusColors.picked_up,
          bgColor: 'rgba(16, 185, 129, 0.1)',
          iconName: 'checkmark-circle-outline',
        };
      case 'on_board':
        return {
          label: 'On Board',
          color: statusColors.on_board,
          bgColor: 'rgba(59, 130, 246, 0.1)',
          iconName: 'checkmark-circle-outline',
        };
      case 'dropped_off':
        return {
          label: 'Dropped Off',
          color: statusColors.dropped_off,
          bgColor: 'rgba(59, 130, 246, 0.1)',
          iconName: 'home-outline',
        };
      case 'absent':
        return {
          label: 'Absent',
          color: statusColors.absent,
          bgColor: 'rgba(239, 68, 68, 0.1)',
          iconName: 'close-circle-outline',
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
  const textSize = size === 'sm' ? 10 : size === 'md' ? 12 : 14;
  const paddingH = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const paddingV = size === 'sm' ? 3 : size === 'md' ? 4 : 6;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      <Ionicons name={config.iconName as any} size={iconSize} color={config.color} />
      <Text style={[styles.label, { color: config.color, fontSize: textSize }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
  },
  label: {
    fontWeight: '600',
  },
});
