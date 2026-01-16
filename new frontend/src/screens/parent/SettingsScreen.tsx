/**
 * Settings Screen
 * Parent account and app settings
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../state/authStore";
import { ParentTabParamList } from "../../navigation/ParentNavigator";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ParentTabParamList, "Settings">,
  NativeStackScreenProps<ParentStackParamList>
>;

export default function SettingsScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [notifications, setNotifications] = useState(true);
  const [pickupAlerts, setPickupAlerts] = useState(true);
  const [dropoffAlerts, setDropoffAlerts] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.headerTitle}>Settings</Text>
        </Animated.View>

        {/* Profile Section */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
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
              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary.black} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Children Management */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Children</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <Pressable
              onPress={() => navigation.navigate("ManageChildren")}
              style={styles.settingItem}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accent.skyBlue + "20" }]}>
                  <Ionicons name="people" size={20} color={colors.accent.skyBlue} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Manage Children</Text>
                  <Text style={styles.settingSubtitle}>
                    Add or edit your children information
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
            </Pressable>
          </LiquidGlassCard>
        </Animated.View>

        {/* Notification Settings */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
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
                      Receive updates about your children
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

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.safetyOrange + "20" }]}>
                    <Ionicons name="log-in" size={20} color={colors.accent.safetyOrange} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Pickup Alerts</Text>
                    <Text style={styles.settingSubtitle}>
                      Notify when child is picked up
                    </Text>
                  </View>
                </View>
                <Switch
                  value={pickupAlerts}
                  onValueChange={setPickupAlerts}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={pickupAlerts ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.success + "20" }]}>
                    <Ionicons name="log-out" size={20} color={colors.status.success} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Drop-off Alerts</Text>
                    <Text style={styles.settingSubtitle}>
                      Notify when child is dropped off
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dropoffAlerts}
                  onValueChange={setDropoffAlerts}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={dropoffAlerts ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.warning + "20" }]}>
                    <Ionicons name="time" size={20} color={colors.status.warning} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Delay Alerts</Text>
                    <Text style={styles.settingSubtitle}>
                      Notify about trip delays
                    </Text>
                  </View>
                </View>
                <Switch
                  value={delayAlerts}
                  onValueChange={setDelayAlerts}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={delayAlerts ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Privacy & Security */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable
                onPress={() => navigation.navigate("PrivacySettings")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.success + "20" }]}>
                    <Ionicons name="finger-print" size={20} color={colors.status.success} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Biometric Login</Text>
                    <Text style={styles.settingSubtitle}>
                      Use fingerprint or Face ID
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                onPress={() => navigation.navigate("ChangePassword")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.warning + "20" }]}>
                    <Ionicons name="key" size={20} color={colors.status.warning} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Change Password</Text>
                    <Text style={styles.settingSubtitle}>
                      Update your account password
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                onPress={() => navigation.navigate("PrivacySettings")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.yellow + "40" }]}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.primary.black} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Privacy Settings</Text>
                    <Text style={styles.settingSubtitle}>
                      Manage your privacy preferences
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Support & Help */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <Text style={styles.sectionTitle}>Support</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable
                onPress={() => navigation.navigate("HelpSupport")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.yellow + "40" }]}>
                    <Ionicons name="help-circle" size={20} color={colors.primary.black} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                    <Text style={styles.settingSubtitle}>
                      Get help and contact support
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                onPress={() => navigation.navigate("TermsPrivacy")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.skyBlue + "20" }]}>
                    <Ionicons name="document-text" size={20} color={colors.accent.skyBlue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Terms & Privacy</Text>
                    <Text style={styles.settingSubtitle}>
                      View terms and privacy policy
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.safetyOrange + "20" }]}>
                    <Ionicons name="star" size={20} color={colors.accent.safetyOrange} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Rate the App</Text>
                    <Text style={styles.settingSubtitle}>
                      Share your feedback
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>About</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>Saferide Parent App</Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(450).springify()}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 16,
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
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary.black,
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
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.yellow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary.black,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary.black + "15",
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
