/**
 * Driver Children Screen
 * View children for today's trip and mark attendance (pickup/dropoff)
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { apiClient } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import { Child } from "../../types";

interface ChildWithAttendance extends Child {
  attendanceStatus?: "PICKED_UP" | "DROPPED" | "MISSED";
  attendanceId?: string;
}

export default function DriverChildrenScreen() {
  const { user } = useAuthStore();
  const [children, setChildren] = useState<ChildWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's trip children
  const fetchChildren = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Fetch children for today's trip
      // For now, show empty list
      setChildren([]);
      console.log('[DriverChildren] Fetched children for trip');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load children';
      setError(errorMsg);
      console.error('[DriverChildren] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [fetchChildren])
  );

  const handlePickup = async (childId: string) => {
    try {
      console.log('[DriverChildren] Marking child as picked up:', childId);
      // TODO: Call attendance API to mark as PICKED_UP
      Alert.alert('Success', 'Child marked as picked up');
    } catch (err) {
      Alert.alert('Error', 'Failed to mark pickup');
      console.error('[DriverChildren] Pickup error:', err);
    }
  };

  const handleDropoff = async (childId: string) => {
    try {
      console.log('[DriverChildren] Marking child as dropped off:', childId);
      // TODO: Call attendance API to mark as DROPPED
      Alert.alert('Success', 'Child marked as dropped off');
    } catch (err) {
      Alert.alert('Error', 'Failed to mark dropoff');
      console.error('[DriverChildren] Dropoff error:', err);
    }
  };

  const handleAbsent = async (childId: string) => {
    try {
      console.log('[DriverChildren] Marking child as absent:', childId);
      // TODO: Call attendance API to mark as MISSED
      Alert.alert('Success', 'Child marked as absent');
    } catch (err) {
      Alert.alert('Error', 'Failed to mark absent');
      console.error('[DriverChildren] Absent error:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>{error}</Text>
        <Pressable onPress={fetchChildren} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Children</Text>
        <Text style={styles.headerSubtitle}>{children.length} on trip</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={colors.neutral.textSecondary} />
            <Text style={styles.emptyText}>No children assigned</Text>
          </View>
        ) : (
          children.map((child, index) => (
            <Animated.View
              key={child.id}
              entering={FadeInDown.delay(100 + index * 50).springify()}
            >
              <LiquidGlassCard intensity="medium" className="mb-3">
                <View style={styles.childCard}>
                  <View style={styles.childInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {`${child.firstName[0]}${child.lastName[0]}`.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.details}>
                      <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                      <View style={styles.pickupInfo}>
                        <Ionicons
                          name={
                            child.pickupType === 'HOME'
                              ? 'home'
                              : child.pickupType === 'ROADSIDE'
                              ? 'location'
                              : 'school'
                          }
                          size={14}
                          color={colors.neutral.textSecondary}
                        />
                        <Text style={styles.pickupText}>
                          {child.pickupType === 'HOME'
                            ? 'Home Pickup'
                            : child.pickupType === 'ROADSIDE'
                            ? `Roadside: ${child.pickupDescription || 'Location'}`
                            : 'School Pickup'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {child.attendanceStatus === 'PICKED_UP'
                        ? '✓ Picked'
                        : child.attendanceStatus === 'DROPPED'
                        ? '✓ Dropped'
                        : child.attendanceStatus === 'MISSED'
                        ? '✗ Absent'
                        : 'Pending'}
                    </Text>
                  </View>

                  {/* Actions */}
                  {!child.attendanceStatus && (
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => handlePickup(child.id)}
                        style={[styles.actionButton, styles.pickupButton]}
                      >
                        <Ionicons name="log-in" size={18} color={colors.neutral.pureWhite} />
                        <Text style={styles.actionText}>Pick</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAbsent(child.id)}
                        style={[styles.actionButton, styles.absentButton]}
                      >
                        <Ionicons name="close" size={18} color={colors.neutral.pureWhite} />
                        <Text style={styles.actionText}>Absent</Text>
                      </Pressable>
                    </View>
                  )}

                  {child.attendanceStatus === 'PICKED_UP' && (
                    <Pressable
                      onPress={() => handleDropoff(child.id)}
                      style={[styles.actionButton, styles.dropoffButton, { width: '100%' }]}
                    >
                      <Ionicons name="log-out" size={18} color={colors.neutral.pureWhite} />
                      <Text style={styles.actionText}>Mark Dropped Off</Text>
                    </Pressable>
                  )}
                </View>
              </LiquidGlassCard>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    marginTop: 12,
  },
  childCard: {
    padding: 16,
    gap: 12,
  },
  childInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.blue,
  },
  details: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickupText: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.primary.blue + '10',
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.blue,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  pickupButton: {
    backgroundColor: colors.accent.successGreen,
  },
  dropoffButton: {
    backgroundColor: colors.accent.sunsetOrange,
  },
  absentButton: {
    backgroundColor: colors.status.warningYellow,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.pureWhite,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.blue,
    borderRadius: 12,
  },
  retryText: {
    color: colors.neutral.pureWhite,
    fontWeight: '600',
  },
});
