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
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlowingOrb } from "../../components/ui/GlowingOrb";
import { useAuthStore } from "../../stores/authStore";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function DriverSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [autoStartTrip, setAutoStartTrip] = useState(false);

  const handleLogout = async () => {
    console.log('[DriverSettingsScreen] Logout pressed');
    try {
      await logout();
      console.log('[DriverSettingsScreen] Logout completed');
    } catch (error) {
      console.log('[DriverSettingsScreen] Logout error:', error);
    }
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
      <GlowingOrb size={150} color="rgba(255, 255, 255, 0.6)" delay={0} duration={11000} startX={-30} startY={20} />
      <GlowingOrb size={120} color="rgba(255, 220, 100, 0.65)" delay={2000} duration={13000} startX={200} startY={50} />
      <GlowingOrb size={100} color="rgba(255, 150, 80, 0.55)" delay={4500} duration={15000} startX={100} startY={80} />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LiquidGlassCard intensity="heavy" className="mb-4">
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
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
        </Animated.View>

        {/* Trip Settings */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Trip Settings</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.yellow + "20" }]}>
                    <Ionicons name="location" size={20} color={colors.primary.yellow} />
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
                    true: colors.status.success + "60",
                  }}
                  thumbColor={locationSharing ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.safetyOrange + "20" }]}>
                    <Ionicons name="play-circle" size={20} color={colors.accent.safetyOrange} />
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
                    true: colors.status.success + "60",
                  }}
                  thumbColor={autoStartTrip ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.info + "20" }]}>
                    <Ionicons name="notifications" size={20} color={colors.status.info} />
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
                    true: colors.status.success + "60",
                  }}
                  thumbColor={notifications ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>Support</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable
                onPress={() => navigation.navigate("PrivacySecurity")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.warning + "20" }]}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.status.warning} />
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
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.yellow + "20" }]}>
                    <Ionicons name="help-circle" size={20} color={colors.primary.yellow} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Text style={styles.sectionTitle}>About</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>SafeRide Driver App</Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <LiquidGlassCard intensity="medium">
              <View style={styles.logoutContent}>
                <Ionicons name="log-out" size={20} color={colors.status.danger} />
                <Text style={styles.logoutText}>Log Out</Text>
              </View>
            </LiquidGlassCard>
          </Pressable>
        </Animated.View>
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
    height: 180,
  },
  safeArea: {
    flex: 1,
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
    backgroundColor: colors.primary.yellow,
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
    color: colors.status.danger,
  },
});
