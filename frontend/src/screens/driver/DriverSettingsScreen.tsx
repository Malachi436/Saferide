/**
 * Driver Settings Screen
 * Driver account and app settings
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../state/authStore";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function DriverSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);

  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [autoStartTrip, setAutoStartTrip] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View>
          <LiquidGlassCard intensity="heavy" className="mb-4">
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Text style={styles.profilePhone}>{user?.phone}</Text>
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Trip Settings */}
        <View>
          <Text style={styles.sectionTitle}>Trip Settings</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.blue + "20" }]}>
                    <Ionicons name="location" size={20} color={colors.primary.blue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Location Sharing</Text>
                    <Text style={styles.settingSubtitle}>
                      Share real-time location with parents
                    </Text>
                  </View>
                </View>
                <Switch
                  value={locationSharing}
                  onValueChange={setLocationSharing}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.accent.successGreen + "60",
                  }}
                  thumbColor={locationSharing ? colors.accent.successGreen : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.sunsetOrange + "20" }]}>
                    <Ionicons name="play-circle" size={20} color={colors.accent.sunsetOrange} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Auto-Start Trip</Text>
                    <Text style={styles.settingSubtitle}>
                      Automatically start trip at scheduled time
                    </Text>
                  </View>
                </View>
                <Switch
                  value={autoStartTrip}
                  onValueChange={setAutoStartTrip}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.accent.successGreen + "60",
                  }}
                  thumbColor={autoStartTrip ? colors.accent.successGreen : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Notifications */}
        <View>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.infoBlue + "20" }]}>
                    <Ionicons name="notifications" size={20} color={colors.status.infoBlue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>
                      Receive updates about trips and messages
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.accent.successGreen + "60",
                  }}
                  thumbColor={notifications ? colors.accent.successGreen : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Account Actions */}
        <View>
          <Text style={styles.sectionTitle}>Support</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable
                onPress={() => navigation.navigate("PrivacySecurity")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.warningYellow + "20" }]}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.status.warningYellow} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Privacy & Security</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                onPress={() => navigation.navigate("HelpSupport")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.blue + "20" }]}>
                    <Ionicons name="help-circle" size={20} color={colors.primary.blue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </View>

        {/* About */}
        <View>
          <Text style={styles.sectionTitle}>About</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>ROSAgo Driver App</Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Logout Button */}
        <View>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LiquidGlassCard intensity="medium">
              <View style={styles.logoutContent}>
                <Ionicons name="log-out" size={20} color={colors.status.dangerRed} />
                <Text style={styles.logoutText}>Log Out</Text>
              </View>
            </LiquidGlassCard>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  profilePhone: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  settingsGroup: {
    padding: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    minHeight: 60,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "20",
    marginHorizontal: 12,
  },
  aboutCard: {
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  versionText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  logoutButton: {
    marginBottom: 20,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.status.dangerRed,
  },
});
