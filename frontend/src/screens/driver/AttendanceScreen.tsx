/**
 * Attendance Screen
 * Shows attendance summary with total children, picked up, and dropped off
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAttendanceStore } from "../../state/attendanceStore";
import { mockTrip, mockChildren } from "../../mock/data";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function AttendanceScreen() {
  const route = useRoute<RouteProp<DriverStackParamList, "Attendance">>();
  const navigation = useNavigation<NavigationProp>();
  
  const getTripStats = useAttendanceStore((s: any) => s.getTripStats);
  const getAttendanceForTrip = useAttendanceStore((s: any) => s.getAttendanceForTrip);

  // TODO: Replace with actual API call to fetch today's trip
  const trip = mockTrip;
  const childrenOnTrip = mockChildren.filter((c) => trip.childIds.includes(c.id));

  // Get attendance stats
  const stats = useMemo(() => {
    return getTripStats(trip.id, trip.childIds);
  }, [trip.id, trip.childIds, getTripStats]);

  const attendance = getAttendanceForTrip(trip.id);

  // Calculate percentages for visual progress
  const pickedUpPercentage = stats.total > 0 ? (stats.pickedUp / stats.total) * 100 : 0;
  const droppedOffPercentage = stats.total > 0 ? (stats.droppedOff / stats.total) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primary.blue, colors.primary.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral.pureWhite} />
          </Pressable>
          <Text style={styles.headerTitle}>Attendance</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Info */}
          <View>
            <Text style={styles.routeName}>Osu - Greenfield Route</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Summary Stats Cards */}
          <View style={styles.statsContainer}>
            {/* Total Children Card */}
            <View
              style={styles.statCard}
            >
              <Pressable onPress={() => navigation.navigate("ChildList", { filter: "all" })}>
                <LiquidGlassCard intensity="heavy">
                  <View style={styles.statContent}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.primary.blue + "20" },
                      ]}
                    >
                      <Ionicons name="people" size={32} color={colors.primary.blue} />
                    </View>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total Children</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </View>

            {/* Picked Up Card */}
            <View
              style={styles.statCard}
            >
              <Pressable onPress={() => navigation.navigate("ChildList", { filter: "picked_up" })}>
                <LiquidGlassCard intensity="heavy">
                  <View style={styles.statContent}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accent.sunsetOrange + "20" },
                      ]}
                    >
                      <Ionicons
                        name="arrow-up-circle"
                        size={32}
                        color={colors.accent.sunsetOrange}
                      />
                    </View>
                    <Text style={styles.statValue}>{stats.pickedUp}</Text>
                    <Text style={styles.statLabel}>Picked Up</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pickedUpPercentage}%`,
                            backgroundColor: colors.accent.sunsetOrange,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </View>

            {/* Dropped Off Card */}
            <View
              style={styles.statCard}
            >
              <Pressable onPress={() => navigation.navigate("ChildList", { filter: "dropped_off" })}>
                <LiquidGlassCard intensity="heavy">
                  <View style={styles.statContent}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accent.successGreen + "20" },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={32}
                        color={colors.accent.successGreen}
                      />
                    </View>
                    <Text style={styles.statValue}>{stats.droppedOff}</Text>
                    <Text style={styles.statLabel}>Dropped Off</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${droppedOffPercentage}%`,
                            backgroundColor: colors.accent.successGreen,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </View>
          </View>

          {/* Children List */}
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Children List</Text>
              {childrenOnTrip.map((child, index) => {
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
                      <Pressable
                        onPress={() => navigation.navigate("ChildList")}
                        style={styles.childContent}
                      >
                        <View style={styles.childInfo}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                              {child.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </Text>
                          </View>
                          <View style={styles.childDetails}>
                            <Text style={styles.childName}>{child.name}</Text>
                            <Text style={styles.childAddress}>
                              {child.pickupLocation.address}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.statusBadge}>
                          <Ionicons name={statusIcon} size={16} color={statusColor} />
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusText}
                          </Text>
                        </View>
                      </Pressable>
                    </LiquidGlassCard>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Actions */}
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Pressable
                onPress={() => navigation.navigate("ChildList")}
                style={styles.actionButton}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="list" size={24} color={colors.primary.blue} />
                    <Text style={styles.actionText}>Manage Attendance</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.neutral.textSecondary}
                    />
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  routeName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.neutral.creamWhite,
    marginBottom: 24,
  },
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: "100%",
  },
  statContent: {
    padding: 20,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    fontWeight: "600",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: colors.neutral.textSecondary + "20",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  childItem: {
    marginBottom: 12,
  },
  childContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  childAddress: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.neutral.creamWhite,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionButton: {
    width: "100%",
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
});
