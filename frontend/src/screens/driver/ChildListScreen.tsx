/**
 * Child List Screen
 * Display and manage attendance for children on the trip
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;
type ChildListRouteProp = RouteProp<DriverStackParamList, "ChildList">;

export default function ChildListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChildListRouteProp>();
  const filter = route.params?.filter || "all";
  const user = useAuthStore((s) => s.user);

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingChild, setUpdatingChild] = useState<string | null>(null);

  const fetchTodayTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;

      const response = await apiClient.get<any>(`/drivers/${user.id}/today-trip`);
      setTrip(response);
    } catch (err: any) {
      console.log('[ChildListScreen] Error fetching trip:', err);
      setError(err.message || 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTodayTrip();
    }, [user?.id])
  );

  const childrenOnTrip = trip?.attendances || [];

  // Calculate stats from attendance records
  const stats = useMemo(() => {
    const total = childrenOnTrip.length;
    const waiting = childrenOnTrip.filter((a: any) => !a.status || a.status === 'PENDING').length;
    const pickedUp = childrenOnTrip.filter((a: any) => a.status === 'PICKED_UP').length;
    const droppedOff = childrenOnTrip.filter((a: any) => a.status === 'DROPPED').length;

    return { total, waiting, pickedUp, droppedOff };
  }, [childrenOnTrip]);

  // Filter children based on selected filter
  const filteredChildren = useMemo(() => {
    if (filter === "all") return childrenOnTrip;

    return childrenOnTrip.filter((attendance: any) => {
      const status = attendance.status;

      if (filter === "waiting") {
        return !status || status === "PENDING";
      } else if (filter === "picked_up") {
        return status === "PICKED_UP";
      } else if (filter === "dropped_off") {
        return status === "DROPPED";
      }

      return true;
    });
  }, [childrenOnTrip, filter]);

  const handlePickup = async (childId: string) => {
    try {
      setUpdatingChild(childId);
      // API call would go here to update attendance status
      console.log('Mark picked up:', childId);
    } catch (err: any) {
      console.log('Error updating attendance:', err);
    } finally {
      setUpdatingChild(null);
    }
  };

  const handleDropoff = async (childId: string) => {
    try {
      setUpdatingChild(childId);
      // API call would go here to update attendance status
      console.log('Mark dropped off:', childId);
    } catch (err: any) {
      console.log('Error updating attendance:', err);
    } finally {
      setUpdatingChild(null);
    }
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "waiting":
        return "Waiting Children";
      case "picked_up":
        return "Picked Up Children";
      case "dropped_off":
        return "Dropped Off Children";
      default:
        return "All Children";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          onPress={() => navigation.setParams({ filter: "all" })}
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "all" && styles.filterChipTextActive,
            ]}
          >
            All ({stats.total})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.setParams({ filter: "waiting" })}
          style={[styles.filterChip, filter === "waiting" && styles.filterChipActive]}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={filter === "waiting" ? colors.neutral.pureWhite : colors.neutral.textSecondary}
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "waiting" && styles.filterChipTextActive,
            ]}
          >
            Waiting ({stats.waiting})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.setParams({ filter: "picked_up" })}
          style={[styles.filterChip, filter === "picked_up" && styles.filterChipActive]}
        >
          <Ionicons
            name="arrow-up-circle"
            size={16}
            color={
              filter === "picked_up" ? colors.neutral.pureWhite : colors.accent.sunsetOrange
            }
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "picked_up" && styles.filterChipTextActive,
            ]}
          >
            Picked Up ({stats.pickedUp})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.setParams({ filter: "dropped_off" })}
          style={[styles.filterChip, filter === "dropped_off" && styles.filterChipActive]}
        >
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={
              filter === "dropped_off" ? colors.neutral.pureWhite : colors.accent.successGreen
            }
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "dropped_off" && styles.filterChipTextActive,
            ]}
          >
            Dropped Off ({stats.droppedOff})
          </Text>
        </Pressable>
      </ScrollView>

      {/* Children List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.blue} />
            <Text style={styles.loadingText}>Loading children...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="information-circle" size={48} color={colors.accent.sunsetOrange} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchTodayTrip}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && childrenOnTrip.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.neutral.textSecondary} />
            <Text style={styles.emptyText}>No children on trip today</Text>
          </View>
        )}

        {!loading && !error && childrenOnTrip.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{getFilterTitle()}</Text>

            {filteredChildren.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={colors.neutral.textSecondary} />
                <Text style={styles.emptyText}>No children in this category</Text>
              </View>
            ) : (
              filteredChildren.map((attendance: any, index: number) => {
                const child = attendance.child;
                const status = attendance.status;
                const childName = child ? `${child.firstName || ''} ${child.lastName || ''}`.trim() : 'Unknown';
                const initials = childName.split(' ').map((n: string) => n[0] || '').join('').toUpperCase() || 'U';

                let statusColor: string = colors.neutral.textSecondary;
                let statusIcon: keyof typeof Ionicons.glyphMap = "time-outline";
                let statusText = "Waiting";

                if (status === "PICKED_UP") {
                  statusColor = colors.accent.sunsetOrange;
                  statusIcon = "arrow-up-circle";
                  statusText = "Picked Up";
                } else if (status === "DROPPED") {
                  statusColor = colors.accent.successGreen;
                  statusIcon = "checkmark-circle";
                  statusText = "Dropped Off";
                }

                return (
                  <Animated.View
                    key={child.id}
                    entering={FadeInDown.delay(100 + index * 50).springify()}
                    style={styles.childItem}
                  >
                    <LiquidGlassCard intensity="medium">
                      <View style={styles.childCard}>
                        {/* Child Info */}
                        <View style={styles.childInfo}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                              {initials}
                            </Text>
                          </View>
                          <View style={styles.childDetails}>
                            <Text style={styles.childName}>{childName}</Text>
                            <View style={styles.locationRow}>
                              <Ionicons
                                name="location"
                                size={14}
                                color={colors.neutral.textSecondary}
                              />
                              <Text style={styles.childAddress} numberOfLines={1}>
                                {child.pickupLocation?.address || 'N/A'}
                              </Text>
                            </View>
                            <View style={styles.statusBadge}>
                              <Ionicons name={statusIcon} size={14} color={statusColor} />
                              <Text style={[styles.statusText, { color: statusColor }]}>
                                {statusText}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                          {(!status || status === "PENDING") && (
                            <Pressable
                              onPress={() => handlePickup(child.id)}
                              disabled={updatingChild === child.id}
                              style={[styles.actionButton, styles.pickupButton]}
                            >
                              {updatingChild === child.id ? (
                                <ActivityIndicator size="small" color={colors.neutral.pureWhite} />
                              ) : (
                                <>
                                  <Ionicons
                                    name="arrow-up-circle"
                                    size={20}
                                    color={colors.neutral.pureWhite}
                                  />
                                  <Text style={styles.actionButtonText}>Pick Up</Text>
                                </>
                              )}
                            </Pressable>
                          )}

                          {status === "PICKED_UP" && (
                            <Pressable
                              onPress={() => handleDropoff(child.id)}
                              disabled={updatingChild === child.id}
                              style={[styles.actionButton, styles.dropoffButton]}
                            >
                              {updatingChild === child.id ? (
                                <ActivityIndicator size="small" color={colors.neutral.pureWhite} />
                              ) : (
                                <>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={colors.neutral.pureWhite}
                                  />
                                  <Text style={styles.actionButtonText}>Drop Off</Text>
                                </>
                              )}
                            </Pressable>
                          )}

                          {status === "DROPPED" && (
                            <View style={styles.completedBadge}>
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={colors.accent.successGreen}
                              />
                              <Text style={styles.completedText}>Completed</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </LiquidGlassCard>
                  </Animated.View>
                );
              })
            )}
          </>
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
  filterContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.textSecondary + "20",
    backgroundColor: colors.neutral.pureWhite,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral.creamWhite,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: colors.primary.blue,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textSecondary,
  },
  filterChipTextActive: {
    color: colors.neutral.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    marginTop: 16,
  },
  childItem: {
    marginBottom: 12,
  },
  childCard: {
    padding: 16,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  childDetails: {
    flex: 1,
    gap: 6,
  },
  childName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  childAddress: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.neutral.creamWhite,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  pickupButton: {
    backgroundColor: colors.accent.sunsetOrange,
  },
  dropoffButton: {
    backgroundColor: colors.accent.successGreen,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
  },
  completedBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent.successGreen + "20",
    gap: 6,
  },
  completedText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.accent.successGreen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
    marginVertical: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.accent.sunsetOrange,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary.blue,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.neutral.pureWhite,
    fontWeight: "600",
    fontSize: 14,
  },
});
