/**
 * Help & Support Screen
 * Help resources and contact support
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";

const FAQ_ITEMS = [
  {
    id: "1",
    question: "How do I mark a child as picked up?",
    answer: "Go to the Child List screen and tap the 'Pick Up' button next to the child's name.",
  },
  {
    id: "2",
    question: "How do I send a message to parents?",
    answer: "Use the Broadcast feature to send messages to all parents or select specific recipients.",
  },
  {
    id: "3",
    question: "What if I'm running late?",
    answer: "Send a quick message through the Broadcast screen to notify parents about the delay.",
  },
  {
    id: "4",
    question: "How do I navigate to a stop?",
    answer: "Open the Route Map and tap the navigate icon next to any stop to open in your maps app.",
  },
];

export default function HelpSupportScreen() {
  const handleCall = () => {
    Linking.openURL("tel:+233501234567");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@rosago.com?subject=Driver Support Request");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/233501234567");
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
            <View style={styles.contactGrid}>
              <Pressable onPress={handleCall} style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: colors.primary.yellow + "20" }]}>
                  <Ionicons name="call" size={24} color={colors.primary.yellow} />
                </View>
                <Text style={styles.contactLabel}>Call</Text>
              </Pressable>

              <Pressable onPress={handleEmail} style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: colors.accent.safetyOrange + "20" }]}>
                  <Ionicons name="mail" size={24} color={colors.accent.safetyOrange} />
                </View>
                <Text style={styles.contactLabel}>Email</Text>
              </Pressable>

              <Pressable onPress={handleWhatsApp} style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: colors.status.success + "20" }]}>
                  <Ionicons name="logo-whatsapp" size={24} color={colors.status.success} />
                </View>
                <Text style={styles.contactLabel}>WhatsApp</Text>
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Quick Help */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.settingsGroup}>
              <Pressable style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.status.info + "20" }]}>
                    <Ionicons name="book" size={20} color={colors.status.info} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>User Guide</Text>
                    <Text style={styles.settingSubtitle}>
                      Learn how to use the app
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.skyBlue + "20" }]}>
                    <Ionicons name="videocam" size={20} color={colors.accent.skyBlue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Video Tutorials</Text>
                    <Text style={styles.settingSubtitle}>
                      Watch step-by-step guides
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.safetyOrange + "20" }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.accent.safetyOrange} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Report an Issue</Text>
                    <Text style={styles.settingSubtitle}>
                      Let us know about problems
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* FAQ */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((faq, index) => (
            <Animated.View
              key={faq.id}
              entering={FadeInDown.delay(400 + index * 50).springify()}
            >
              <LiquidGlassCard intensity="light" className="mb-3">
                <View style={styles.faqCard}>
                  <View style={styles.faqHeader}>
                    <Ionicons
                      name="help-circle"
                      size={20}
                      color={colors.primary.yellow}
                    />
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              </LiquidGlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Emergency Contacts */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.emergencyCard}>
              <View style={styles.emergencyItem}>
                <View style={styles.emergencyLeft}>
                  <View style={[styles.emergencyIcon, { backgroundColor: colors.status.danger + "20" }]}>
                    <Ionicons name="warning" size={20} color={colors.status.danger} />
                  </View>
                  <View>
                    <Text style={styles.emergencyTitle}>Company Admin</Text>
                    <Text style={styles.emergencyContact}>+233 50 111 2222</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => Linking.openURL("tel:+233501112222")}
                  style={styles.callButton}
                >
                  <Ionicons name="call" size={18} color={colors.neutral.pureWhite} />
                </Pressable>
              </View>

              <View style={styles.divider} />

              <View style={styles.emergencyItem}>
                <View style={styles.emergencyLeft}>
                  <View style={[styles.emergencyIcon, { backgroundColor: colors.status.danger + "20" }]}>
                    <Ionicons name="medical" size={20} color={colors.status.danger} />
                  </View>
                  <View>
                    <Text style={styles.emergencyTitle}>Emergency Services</Text>
                    <Text style={styles.emergencyContact}>191 / 193</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => Linking.openURL("tel:191")}
                  style={styles.callButton}
                >
                  <Ionicons name="call" size={18} color={colors.neutral.pureWhite} />
                </Pressable>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Saferide Driver Support</Text>
              <Text style={styles.infoText}>
                Our support team is available 24/7 to help you with any questions or issues.
              </Text>
              <Text style={styles.infoEmail}>support@rosago.com</Text>
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
  contactGrid: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
    justifyContent: "space-around",
  },
  contactCard: {
    alignItems: "center",
    gap: 8,
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
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
  faqCard: {
    padding: 16,
    gap: 8,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    lineHeight: 20,
    marginLeft: 28,
  },
  emergencyCard: {
    padding: 8,
  },
  emergencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  emergencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  emergencyContact: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  infoText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  infoEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.yellow,
    marginTop: 4,
  },
});
