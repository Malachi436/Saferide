/**
 * Child List Screen
 * Display and manage attendance for children on the trip
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAttendanceStore } from "../../state/attendanceStore";
import { mockTrip, mockChildren } from "../../mock/data";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;
type ChildListRouteProp = RouteProp<DriverStackParamList, "ChildList">;

export default function ChildListScreen() {
  const route = useRoute<ChildListRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  
  const markPickedUp = useAttendanceStore((s: any) => s.markPickedUp);
  const markDroppedOff = useAttendanceStore((s: any) => s.markDroppedOff);
  const getAttendanceForTrip = useAttendanceStore((s: any) => s.getAttendanceForTrip);
  const getTripStats = useAttendanceStore((s: any) => s.getTripStats);

  // TODO: Replace with actual API call to fetch today's trip
  const trip = mockTrip;
  const childrenOnTrip = mockChildren.filter((c) => trip.childIds.includes(c.id));
  
  // Get filter from route params, default to "all"
  const filter = route.params?.filter || "all";

  const attendance = getAttendanceForTrip(trip.id);
  const stats = useMemo(() => {
    return getTripStats(trip.id, trip.childIds);
  }, [trip.id, trip.childIds, getTripStats]);

  // Filter children based on selected filter
  const filteredChildren = useMemo(() => {
    if (filter === "all") return childrenOnTrip;

    return childrenOnTrip.filter((child) => {
      const attendanceRecord = attendance.find((a: any) => a.childId === child.id);
      const status = attendanceRecord?.status || child.status;

      if (filter === "waiting") {
        return status === "waiting";
      } else if (filter === "picked_up") {
        return status === "picked_up" || status === "on_way";
      } else if (filter === "dropped_off") {
        return status === "dropped_off";
      }

      return true;
    });
  }, [childrenOnTrip, attendance, filter]);

  const handlePickup = (childId: string) => {
    markPickedUp(trip.id, childId);
  };

  const handleDropoff = (childId: string) => {
    markDroppedOff(trip.id, childId);
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
        <Text style={styles.sectionTitle}>{getFilterTitle()}</Text>

        {filteredChildren.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.neutral.textSecondary} />
            <Text style={styles.emptyText}>No children in this category</Text>
          </View>
        ) : (
          filteredChildren.map((child, index) => {
            const attendanceRecord = attendance.find((a: any) => a.childId === child.id);
            const status = attendanceRecord?.status || child.status;

            let statusColor: string = colors.neutral.textSecondary;
            let statusIcon: keyof typeof Ionicons.glyphMap = "time-outline";
            let statusText = "Waiting";

            if (status === "picked_up" || status === "on_way") {
              statusColor = colors.accent.sunsetOrange;
              statusIcon = "arrow-up-circle";
              statusText = "Picked Up";
            } else if (status === "dropped_off") {
              statusColor = colors.accent.successGreen;
              statusIcon = "checkmark-circle";
              statusText = "Dropped Off";
            }

            return (
              <View
                key={child.id}
                style={styles.childItem}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.childCard}>
                    {/* Child Info */}
                    <View style={styles.childInfo}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                          {child.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Text>
                      </View>
                      <View style={styles.childDetails}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <View style={styles.locationRow}>
                          <Ionicons
                            name="location"
                            size={14}
                            color={colors.neutral.textSecondary}
                          />
                          <Text style={styles.childAddress} numberOfLines={1}>
                            {child.pickupLocation.address}
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
                      {status === "waiting" && (
                        <Pressable
                          onPress={() => handlePickup(child.id)}
                          style={[styles.actionButton, styles.pickupButton]}
                        >
                          <Ionicons
                            name="arrow-up-circle"
                            size={20}
                            color={colors.neutral.pureWhite}
                          />
                          <Text style={styles.actionButtonText}>Pick Up</Text>
                        </Pressable>
                      )}

                      {(status === "picked_up" || status === "on_way") && (
                        <Pressable
                          onPress={() => handleDropoff(child.id)}
                          style={[styles.actionButton, styles.dropoffButton]}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.neutral.pureWhite}
                          />
                          <Text style={styles.actionButtonText}>Drop Off</Text>
                        </Pressable>
                      )}

                      {status === "dropped_off" && (
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
              </View>
            );
          })
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
});
