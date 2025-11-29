import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Child } from '../types';
import { StatusBadge } from './StatusBadge';
import { LiquidCard } from './LiquidCard';

interface ChildTileProps {
  child: Child;
  onPress?: () => void;
  showStatus?: boolean;
}

export const ChildTile: React.FC<ChildTileProps> = ({ 
  child, 
  onPress,
  showStatus = true 
}) => {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LiquidCard className="mb-3">
        <View style={styles.container}>
          <View style={styles.leftSection}>
            {child.image ? (
              <Image source={{ uri: child.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {child.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{child.name}</Text>
              <Text style={styles.school}>{child.school}</Text>
              {child.grade && (
                <Text style={styles.grade}>{child.grade}</Text>
              )}
            </View>
          </View>
          {showStatus && (
            <StatusBadge status={child.status} />
          )}
        </View>
      </LiquidCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  school: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  grade: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
