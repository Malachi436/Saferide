/**
 * Early Pickup Requests Screen
 * Display and manage parent requests for early child pickup
 */

import React, { useState, useEffect } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { GlowingOrb } from "../../components/ui/GlowingOrb";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

interface EarlyPickupRequest {
  id: string;
  childId: string;
  tripId: string;
  child: {
    firstName: string;
    lastName: string;
  };
  requestedByUser: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedTime: string;
}

export default function EarlyPickupRequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);

  const [requests, setRequests] = useState<EarlyPickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayTrip, setTodayTrip] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchTodayTrip();
      }
    }, [user?.id])
  );

  const fetchTodayTrip = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/drivers/${user?.id}/today-trip`);
      setTodayTrip(response);
      if ((response as any)?.id) {
        fetchPendingRequests((response as any).id);
      }
    } catch (err: any) {
      console.log('[EarlyPickup] Error fetching trip:', err);
      setError('Failed to load trip information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async (tripId: string) => {
    try {
      const response = await apiClient.get<EarlyPickupRequest[]>(
        `/early-pickup/trip/${tripId}/pending`
      );
      setRequests(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.log('[EarlyPickup] Error fetching requests:', err);
      setRequests([]);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await apiClient.put(`/early-pickup/${requestId}/approve`, {});
      Alert.alert('Success', 'Early pickup request approved');
      // Refresh the list
      if (todayTrip?.id) {
        fetchPendingRequests(todayTrip.id);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to approve request';
      Alert.alert('Error', message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    Alert.prompt(
      'Reject Request',
      'Provide a reason (optional)',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Reject',
          onPress: async (reason: string | undefined) => {
            try {
              setProcessingId(requestId);
              await apiClient.put(`/early-pickup/${requestId}/reject`, {
                reason: reason || 'Request rejected by driver',
              });
              Alert.alert('Success', 'Request rejected');
              if (todayTrip?.id) {
                fetchPendingRequests(todayTrip.id);
              }
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to reject request';
              Alert.alert('Error', message);
            } finally {
              setProcessingId(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.yellow, colors.primary.darkYellow, colors.accent.safetyOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Floating Glowing Orbs */}
      <GlowingOrb size={140} color="rgba(255, 255, 255, 0.6)" delay={0} duration={12000} startX={-25} startY={15} />
      <GlowingOrb size={110} color="rgba(255, 220, 100, 0.65)" delay={2500} duration={14000} startX={190} startY={45} />
      <GlowingOrb size={90} color="rgba(255, 150, 80, 0.55)" delay={5000} duration={16000} startX={90} startY={75} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.neutral.pureWhite} />
          </Pressable>
          <Text style={styles.headerTitle}>Early Pickup Requests</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary.yellow} />
            </View>
          )}

          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.status.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <LargeCTAButton
                title="Retry"
                onPress={fetchTodayTrip}
                variant="secondary"
                style={styles.retryButton}
              />
            </View>
          )}

          {!isLoading && !error && requests.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={48} color={colors.status.success} />
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
              <Text style={styles.emptyText}>
                All early pickup requests have been handled
              </Text>
            </View>
          )}

          {requests.map((request, index) => (
            <Animated.View
              key={request.id}
              entering={FadeInDown.delay(index * 100).duration(500)}
            >
              <LiquidGlassCard className="mb-3" intensity="medium">
                <View style={styles.requestCard}>
                  {/* Child Info */}
                  <View style={styles.childInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {request.child.firstName[0]}{request.child.lastName[0]}
                      </Text>
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.childName}>
                        {request.child.firstName} {request.child.lastName}
                      </Text>
                      <Text style={styles.parentName}>
                        {request.requestedByUser.firstName} {request.requestedByUser.lastName}
                      </Text>
                      {request.reason && (
                        <Text style={styles.reason}>{request.reason}</Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.approveButton,
                        processingId === request.id && styles.actionButtonDisabled,
                      ]}
                      onPress={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.neutral.pureWhite}
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={colors.neutral.pureWhite}
                          />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.rejectButton,
                        processingId === request.id && styles.actionButtonDisabled,
                      ]}
                      onPress={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.neutral.pureWhite}
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={colors.neutral.pureWhite}
                          />
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </LiquidGlassCard>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.danger,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    width: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  requestCard: {
    padding: 8,
  },
  childInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  infoContent: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  parentName: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  reason: {
    fontSize: 12,
    color: colors.status.warning,
    marginTop: 4,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
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
  approveButton: {
    backgroundColor: colors.status.success,
  },
  rejectButton: {
    backgroundColor: colors.status.danger,
  },
  actionButtonText: {
    color: colors.neutral.pureWhite,
    fontSize: 12,
    fontWeight: "600",
  },
});
