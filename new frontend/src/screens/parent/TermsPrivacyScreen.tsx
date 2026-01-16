/**
 * Terms & Privacy Screen
 * View terms of service and privacy policy
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";

export default function TermsPrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Terms of Service */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionTitle}>Terms of Service</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.textContent}>
              <Text style={styles.paragraph}>
                Welcome to Saferide. By using our service, you agree to these terms. Please read them
                carefully.
              </Text>

              <Text style={styles.subheading}>1. Use of Service</Text>
              <Text style={styles.paragraph}>
                Saferide provides school transportation services. You may use our service only as
                permitted by law and these terms. We may suspend or stop providing our services to
                you if you do not comply with our terms or if we investigate suspected misconduct.
              </Text>

              <Text style={styles.subheading}>2. Your Account</Text>
              <Text style={styles.paragraph}>
                You are responsible for safeguarding your account. Do not share your password with
                others. We cannot and will not be liable for any loss or damage from your failure
                to comply with this security obligation.
              </Text>

              <Text style={styles.subheading}>3. Child Safety</Text>
              <Text style={styles.paragraph}>
                The safety of your children is our top priority. All drivers are thoroughly vetted
                and monitored. However, parents/guardians remain ultimately responsible for their
                children&apos;s safety and wellbeing.
              </Text>

              <Text style={styles.subheading}>4. Payment Terms</Text>
              <Text style={styles.paragraph}>
                Payment for services is due in advance. We accept mobile money and bank transfers.
                Late payments may result in service suspension.
              </Text>

              <Text style={styles.subheading}>5. Liability</Text>
              <Text style={styles.paragraph}>
                While we take every precaution to ensure safety, Saferide is not liable for delays,
                accidents, or incidents beyond our reasonable control.
              </Text>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Privacy Policy */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <LiquidGlassCard intensity="light" className="mb-4">
            <View style={styles.textContent}>
              <Text style={styles.paragraph}>
                Your privacy is important to us. This policy explains how we collect, use, and
                protect your information.
              </Text>

              <Text style={styles.subheading}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>
                We collect information you provide directly to us, including your name, email,
                phone number, and your children&apos;s information. We also collect location data
                for tracking purposes.
              </Text>

              <Text style={styles.subheading}>2. How We Use Your Information</Text>
              <Text style={styles.paragraph}>
                We use your information to provide and improve our services, communicate with you
                about your account, ensure the safety of your children, and comply with legal
                obligations.
              </Text>

              <Text style={styles.subheading}>3. Location Data</Text>
              <Text style={styles.paragraph}>
                We collect real-time location data to track buses and provide you with accurate
                pickup and dropoff information. This data is only used for service delivery and is
                not shared with third parties.
              </Text>

              <Text style={styles.subheading}>4. Data Security</Text>
              <Text style={styles.paragraph}>
                We implement industry-standard security measures to protect your information.
                However, no method of transmission over the internet is 100% secure.
              </Text>

              <Text style={styles.subheading}>5. Your Rights</Text>
              <Text style={styles.paragraph}>
                You have the right to access, update, or delete your personal information at any
                time. Contact us at privacy@rosago.com for any privacy-related requests.
              </Text>

              <Text style={styles.subheading}>6. Children&apos;s Privacy</Text>
              <Text style={styles.paragraph}>
                We take special care to protect children&apos;s information. We only collect
                information necessary for service delivery and do not share it with third parties
                except as required by law.
              </Text>

              <Text style={styles.subheading}>7. Updates to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this policy from time to time. We will notify you of any significant
                changes via email or through the app.
              </Text>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Contact */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <LiquidGlassCard intensity="medium" className="mb-4">
            <View style={styles.contactContent}>
              <Text style={styles.contactText}>
                If you have questions about these terms or our privacy policy, please contact us:
              </Text>
              <Text style={styles.contactEmail}>legal@rosago.com</Text>
              <Text style={styles.contactPhone}>+233 50 123 4567</Text>
              <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
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
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  textContent: {
    padding: 20,
    gap: 16,
  },
  paragraph: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    lineHeight: 22,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginTop: 8,
  },
  contactContent: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.yellow,
  },
  contactPhone: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.yellow,
  },
  lastUpdated: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginTop: 12,
  },
});
