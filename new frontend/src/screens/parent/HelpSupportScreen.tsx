/**
 * Help & Support Screen
 * Get help and contact support
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";

export default function HelpSupportScreen() {
  const handleCall = () => {
    Linking.openURL("tel:+233501234567");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@rosago.com");
  };

  const handleWhatsApp = () => {
    Linking.openURL("whatsapp://send?phone=233501234567");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Support */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.contactGroup}>
              <Pressable onPress={handleCall} style={styles.contactItem}>
                <View style={[styles.contactIcon, { backgroundColor: colors.primary.yellow + "20" }]}>
                  <Ionicons name="call" size={24} color={colors.primary.yellow} />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>Call Us</Text>
                  <Text style={styles.contactSubtitle}>+233 50 123 4567</Text>
                </View>
              </Pressable>

              <View style={styles.divider} />

              <Pressable onPress={handleEmail} style={styles.contactItem}>
                <View style={[styles.contactIcon, { backgroundColor: colors.accent.skyBlue + "20" }]}>
                  <Ionicons name="mail" size={24} color={colors.accent.skyBlue} />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactSubtitle}>support@rosago.com</Text>
                </View>
              </Pressable>

              <View style={styles.divider} />

              <Pressable onPress={handleWhatsApp} style={styles.contactItem}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: colors.status.success + "20" },
                  ]}
                >
                  <Ionicons name="logo-whatsapp" size={24} color={colors.status.success} />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>WhatsApp</Text>
                  <Text style={styles.contactSubtitle}>Chat with us</Text>
                </View>
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Quick Help */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.helpGroup}>
              <Pressable style={styles.helpItem}>
                <View
                  style={[styles.helpIcon, { backgroundColor: colors.accent.safetyOrange + "20" }]}
                >
                  <Ionicons name="book" size={20} color={colors.accent.safetyOrange} />
                </View>
                <View style={styles.helpText}>
                  <Text style={styles.helpTitle}>User Guide</Text>
                  <Text style={styles.helpSubtitle}>Learn how to use Saferide</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.helpItem}>
                <View
                  style={[styles.helpIcon, { backgroundColor: colors.status.info + "20" }]}
                >
                  <Ionicons name="play-circle" size={20} color={colors.status.info} />
                </View>
                <View style={styles.helpText}>
                  <Text style={styles.helpTitle}>Video Tutorials</Text>
                  <Text style={styles.helpSubtitle}>Watch how-to videos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.helpItem}>
                <View
                  style={[styles.helpIcon, { backgroundColor: colors.status.danger + "20" }]}
                >
                  <Ionicons name="alert-circle" size={20} color={colors.status.danger} />
                </View>
                <View style={styles.helpText}>
                  <Text style={styles.helpTitle}>Report an Issue</Text>
                  <Text style={styles.helpSubtitle}>Let us know about problems</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* FAQ */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.faqGroup}>
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How do I add a new child?</Text>
                <Text style={styles.faqAnswer}>
                  Go to Settings → Manage Children → Add New Child and fill in the required
                  information.
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How do I track my child in real-time?</Text>
                <Text style={styles.faqAnswer}>
                  Use the Track tab to see your child&apos;s location and estimated arrival time.
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I change my child&apos;s pickup address?</Text>
                <Text style={styles.faqAnswer}>
                  Yes, go to Manage Children, select the child, and update their pickup address.
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How do I contact my driver?</Text>
                <Text style={styles.faqAnswer}>
                  You can call the driver directly from the home screen or tracking screen using
                  the call button.
                </Text>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Emergency */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.emergencyGroup}>
              <Pressable
                onPress={() => Linking.openURL("tel:191")}
                style={styles.emergencyItem}
              >
                <View
                  style={[styles.emergencyIcon, { backgroundColor: colors.status.danger + "20" }]}
                >
                  <Ionicons name="medical" size={24} color={colors.status.danger} />
                </View>
                <View style={styles.emergencyText}>
                  <Text style={styles.emergencyTitle}>Emergency Hotline</Text>
                  <Text style={styles.emergencySubtitle}>191</Text>
                </View>
                <Ionicons name="call" size={20} color={colors.status.danger} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                onPress={() => Linking.openURL("tel:+233501234567")}
                style={styles.emergencyItem}
              >
                <View
                  style={[
                    styles.emergencyIcon,
                    { backgroundColor: colors.status.warning + "20" },
                  ]}
                >
                  <Ionicons name="shield-checkmark" size={24} color={colors.status.warning} />
                </View>
                <View style={styles.emergencyText}>
                  <Text style={styles.emergencyTitle}>Saferide Safety Line</Text>
                  <Text style={styles.emergencySubtitle}>+233 50 123 4567</Text>
                </View>
                <Ionicons name="call" size={20} color={colors.status.warning} />
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
  contactGroup: {
    padding: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 16,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "20",
    marginHorizontal: 12,
  },
  helpGroup: {
    padding: 4,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  faqGroup: {
    padding: 16,
  },
  faqItem: {
    paddingVertical: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    lineHeight: 20,
  },
  emergencyGroup: {
    padding: 8,
  },
  emergencyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 16,
  },
  emergencyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
});
