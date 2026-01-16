/**
 * ChildTile Component
 * Display child information with initials and status
 */

import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Child } from "../../types";
import { colors } from "../../theme";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { apiClient } from "../../utils/api";

interface ChildTileProps {
  child: Child;
  onPress?: () => void;
  showStatus?: boolean;
  tripId?: string;
  showActions?: boolean;
  onActionComplete?: () => void;
}

export function ChildTile({ child, onPress, showStatus = true, tripId, showActions = false, onActionComplete }: ChildTileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [earlyPickupPending, setEarlyPickupPending] = useState(false);
  const [tripSkipped, setTripSkipped] = useState(false);
  const statusConfig = {
    waiting: { icon: "time-outline", color: colors.status.warning, label: "Waiting" },
    picked_up: { icon: "checkmark-circle", color: colors.status.success, label: "Picked Up" },
    on_way: { icon: "car-outline", color: colors.status.info, label: "On the way" },
    arrived: { icon: "location", color: colors.status.success, label: "Arrived" },
    dropped_off: { icon: "checkmark-done-circle", color: colors.status.success, label: "Dropped Off" },
  };

  const status = child.status ? statusConfig[child.status as keyof typeof statusConfig] : undefined;

  // Get initials from child name
  const initials = `${child.firstName[0]}${child.lastName[0]}`.toUpperCase();

  const handleRequestParentPickup = async () => {
    if (!tripId) {
      Alert.alert('No Active Trip', 'There is no active trip for your child today.');
      return;
    }

    // Show time selection dialog
    Alert.alert(
      'Parent Pickup',
      'When will you be picking up your child?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Morning',
          onPress: () => submitParentPickup('MORNING'),
        },
        {
          text: 'Evening',
          onPress: () => submitParentPickup('EVENING'),
        },
      ],
      { cancelable: true }
    );
  };

  const submitParentPickup = async (timeOfDay: 'MORNING' | 'EVENING') => {
    try {
      setIsLoading(true);
      await apiClient.post('/early-pickup/request', {
        childId: child.id,
        tripId,
        timeOfDay,
        reason: `Parent will pick up child in the ${timeOfDay.toLowerCase()}`,
      });
      setEarlyPickupPending(true);
      Alert.alert('Success', `Child exempted from ${timeOfDay.toLowerCase()} pickup. Driver has been notified.`);
      onActionComplete?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to request parent pickup';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipTrip = async () => {
    if (!tripId) {
      Alert.alert('No Active Trip', 'There is no active trip for your child today.');
      return;
    }

    Alert.alert(
      'Skip Today',
      'Are you sure your child will not join the bus today?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await apiClient.post('/trip-exceptions/skip', {
                childId: child.id,
                tripId,
              });
              setTripSkipped(true);
              Alert.alert('Success', 'Child removed from today\'s attendance. Driver has been notified.');
              onActionComplete?.();
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to skip trip';
              Alert.alert('Error', message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUnskipTrip = async () => {
    if (!tripId) {
      Alert.alert('No Active Trip', 'There is no active trip for your child today.');
      return;
    }

    // Prompt for reason
    Alert.prompt(
      '🚨 Emergency Unskip',
      'Please explain why you need emergency pickup:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Request Pickup',
          style: 'default',
          onPress: async (reason?: string) => {
            if (!reason || !reason.trim()) {
              Alert.alert('Error', 'Please provide a reason for emergency pickup');
              return;
            }

            try {
              setIsLoading(true);
              await apiClient.post('/trip-exceptions/unskip', {
                childId: child.id,
                tripId,
                reason: reason.trim(),
              });
              setTripSkipped(false);
              Alert.alert(
                'Driver Notified!',
                'The driver has been notified about the urgent pickup request and must acknowledge before proceeding.'
              );
              onActionComplete?.();
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to request emergency pickup';
              Alert.alert('Error', message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View>
      <Pressable onPress={onPress} disabled={!onPress}>
        <LiquidGlassCard className="mb-3">
          <View style={styles.container}>
            {/* Avatar with Initials */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, tripSkipped && { backgroundColor: colors.status.danger + "20" }]}>
                <Text style={[styles.avatarText, tripSkipped && { color: colors.status.danger }]}>{initials}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Text style={[styles.name, tripSkipped && { textDecorationLine: "line-through", color: colors.neutral.textSecondary }]}>
                {child.firstName} {child.lastName}
              </Text>
              <Text style={styles.pickupType}>
                {child.pickupType === "HOME" ? "Home Pickup" : child.pickupType === "ROADSIDE" ? "Roadside Pickup" : "School Pickup"}
              </Text>
              {child.pickupDescription && (
                <Text style={styles.address} numberOfLines={1}>
                  {child.pickupDescription}
                </Text>
              )}
              {tripSkipped && <Text style={styles.skippedBadge}>Skipped for today</Text>}
              {earlyPickupPending && <Text style={styles.earlyPickupBadge}>Parent pickup requested</Text>}
            </View>

            {/* Status */}
            {showStatus && child.status && (
              <View style={styles.statusContainer}>
                <Ionicons name={status?.icon as any} size={24} color={status?.color} />
                <Text style={[styles.statusText, { color: status?.color }]}>{status?.label}</Text>
              </View>
            )}
          </View>
        </LiquidGlassCard>
      </Pressable>

      {/* Action Buttons */}
      {showActions && !tripSkipped && (
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.actionButton, styles.earlyPickupButton, (earlyPickupPending || !tripId) && styles.actionButtonDisabled]}
            onPress={handleRequestParentPickup}
            disabled={isLoading || earlyPickupPending}
          >
            {isLoading && earlyPickupPending ? (
              <ActivityIndicator size="small" color={colors.neutral.pureWhite} />
            ) : (
              <>
                <Ionicons name="person-outline" size={18} color={colors.neutral.pureWhite} />
                <Text style={styles.actionButtonText}>Parent Pickup</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.skipButton, !tripId && styles.actionButtonDisabled]}
            onPress={handleSkipTrip}
            disabled={isLoading}
          >
            {isLoading && !earlyPickupPending ? (
              <ActivityIndicator size="small" color={colors.neutral.pureWhite} />
            ) : (
              <>
                <Ionicons name="close-circle" size={18} color={colors.neutral.pureWhite} />
                <Text style={styles.actionButtonText}>Skip Today</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Unskip Button - Shows when trip is skipped */}
      {showActions && tripSkipped && (
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.actionButton, styles.unskipButton, !tripId && styles.actionButtonDisabled]}
            onPress={handleUnskipTrip}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.neutral.pureWhite} />
            ) : (
              <>
                <Ionicons name="alert-circle" size={18} color={colors.neutral.pureWhite} />
                <Text style={styles.actionButtonText}>🚨 Emergency Unskip</Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  pickupType: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  statusContainer: {
    alignItems: "center",
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  skippedBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.danger,
    marginTop: 4,
  },
  earlyPickupBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.success,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  earlyPickupButton: {
    backgroundColor: colors.status.success,
  },
  skipButton: {
    backgroundColor: colors.status.danger,
  },
  unskipButton: {
    backgroundColor: colors.accent.safetyOrange,
  },
  actionButtonText: {
    color: colors.neutral.pureWhite,
    fontSize: 13,
    fontWeight: "600",
  },
});
