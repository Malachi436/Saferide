/**
 * Privacy Settings Screen
 * Privacy and security preferences
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";

export default function PrivacySettingsScreen() {
  const [shareLocation, setShareLocation] = useState(true);
  const [sharePhone, setSharePhone] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [biometric, setBiometric] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[styles.settingIcon, { backgroundColor: colors.primary.yellow + "20" }]}
                  >
                    <Ionicons name="location" size={20} color={colors.primary.yellow} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Share Location</Text>
                    <Text style={styles.settingSubtitle}>
                      Allow driver to see your location
                    </Text>
                  </View>
                </View>
                <Switch
                  value={shareLocation}
                  onValueChange={setShareLocation}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={shareLocation ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[styles.settingIcon, { backgroundColor: colors.accent.skyBlue + "20" }]}
                  >
                    <Ionicons name="call" size={20} color={colors.accent.skyBlue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Share Phone Number</Text>
                    <Text style={styles.settingSubtitle}>
                      Allow driver to see your phone
                    </Text>
                  </View>
                </View>
                <Switch
                  value={sharePhone}
                  onValueChange={setSharePhone}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={sharePhone ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: colors.accent.safetyOrange + "20" },
                    ]}
                  >
                    <Ionicons name="chatbubble" size={20} color={colors.accent.safetyOrange} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Allow Messages</Text>
                    <Text style={styles.settingSubtitle}>
                      Receive messages from driver
                    </Text>
                  </View>
                </View>
                <Switch
                  value={allowMessages}
                  onValueChange={setAllowMessages}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={allowMessages ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Security</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: colors.status.success + "20" },
                    ]}
                  >
                    <Ionicons name="finger-print" size={20} color={colors.status.success} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Biometric Login</Text>
                    <Text style={styles.settingSubtitle}>
                      Use fingerprint or Face ID
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometric}
                  onValueChange={setBiometric}
                  trackColor={{
                    false: colors.neutral.textSecondary + "40",
                    true: colors.status.success + "60",
                  }}
                  thumbColor={biometric ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + "40"}
                />
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Data & Storage */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: colors.status.info + "20" },
                    ]}
                  >
                    <Ionicons name="download" size={20} color={colors.status.info} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Download My Data</Text>
                    <Text style={styles.settingSubtitle}>
                      Get a copy of your data
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: colors.status.warning + "20" },
                    ]}
                  >
                    <Ionicons name="trash" size={20} color={colors.status.warning} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Clear Cache</Text>
                    <Text style={styles.settingSubtitle}>Free up storage space</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
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
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "20",
    marginHorizontal: 12,
  },
});
