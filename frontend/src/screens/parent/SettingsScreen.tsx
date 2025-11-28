/**
 * Settings Screen
 * Parent account and app settings
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ParentTabParamList, ParentStackParamList } from "../../navigation/ParentNavigator";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../state/authStore";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ParentTabParamList, "Settings">,
  NativeStackScreenProps<ParentStackParamList>
>;

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParentStackParamList>>();
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);

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
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

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
              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary.blue} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Children Management */}
        <View>
          <Text style={styles.sectionTitle}>Children</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <Pressable
              onPress={() => navigation.navigate("ManageChildren")}
              style={styles.settingItem}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primary.teal + "20" }]}>
                  <Ionicons name="people" size={20} color={colors.primary.teal} />
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
        </View>

        {/* Notification Settings */}
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
                      Receive updates about your children
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
              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.sunsetOrange + "20" }]}>
                    <Ionicons name="log-in" size={20} color={colors.accent.sunsetOrange} />
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
                    true: colors.accent.successGreen + "60",
                  }}
                  thumbColor={pickupAlerts ? colors.accent.successGreen : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.successGreen + "20" }]}>
                    <Ionicons name="log-out" size={20} color={colors.accent.successGreen} />
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
                    true: colors.accent.successGreen + "60",
                  }}
                  thumbColor={dropoffAlerts ? colors.accent.successGreen : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.warningYellow + "20" }]}>
                    <Ionicons name="time" size={20} color={colors.status.warningYellow} />
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
                    true: colors.accent.successGreen + "60",
                  }}
                  thumbColor={delayAlerts ? colors.accent.successGreen : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Privacy & Security */}
        <View>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable
                onPress={() => navigation.navigate("PrivacySettings")}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.successGreen + "20" }]}>
                    <Ionicons name="finger-print" size={20} color={colors.accent.successGreen} />
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
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.warningYellow + "20" }]}>
                    <Ionicons name="key" size={20} color={colors.status.warningYellow} />
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
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.blue + "20" }]}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.primary.blue} />
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
        </View>

        {/* Support & Help */}
        <View>
          <Text style={styles.sectionTitle}>Support</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
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
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary.teal + "20" }]}>
                    <Ionicons name="document-text" size={20} color={colors.primary.teal} />
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
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.sunsetOrange + "20" }]}>
                    <Ionicons name="star" size={20} color={colors.accent.sunsetOrange} />
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
        </View>

        {/* About */}
        <View>
          <Text style={styles.sectionTitle}>About</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>ROSAgo Parent App</Text>
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
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
