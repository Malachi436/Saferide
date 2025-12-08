/**
 * Payments Screen
 * Manage and make payments for school bus subscriptions
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type Props = NativeStackScreenProps<ParentStackParamList, "Payments">;

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  frequency: string;
  description: string;
  features: string[];
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isPopular?: boolean;
}

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: "daily",
    name: "Daily Plan",
    price: 25,
    frequency: "/daily",
    description: "Pay per trip, daily",
    features: ["Pay as you go", "Real-time tracking", "SMS notifications"],
    icon: "calendar",
    iconColor: colors.primary.blue,
  },
  {
    id: "weekly",
    name: "Weekly Plan",
    price: 150,
    frequency: "/weekly",
    description: "5% discount - Best for regular use",
    features: [
      "5 school days covered",
      "Real-time tracking",
      "SMS notifications",
    ],
    icon: "calendar-outline",
    iconColor: colors.accent.sunsetOrange,
    isPopular: true,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 500,
    frequency: "/monthly",
    description: "15% discount - Best value",
    features: [
      "~20 school days covered",
      "Real-time tracking",
      "SMS notifications",
    ],
    icon: "calendar",
    iconColor: colors.accent.successGreen,
  },
];

export default function PaymentsScreen({ navigation }: Props) {
  const [activeSubscription] = useState({
    plan: "Weekly Plan",
    amount: 150,
    paymentMethod: "Mobile Money",
    nextPayment: "6 Dec 2025",
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Subscription Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LiquidGlassCard intensity="medium" className="mb-6">
            <View style={styles.activeSubscriptionCard}>
              <View style={styles.activeHeader}>
                <View style={styles.checkmarkIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={40}
                    color={colors.accent.successGreen}
                  />
                </View>
                <View style={styles.activeInfo}>
                  <Text style={styles.activeLabel}>Active Subscription</Text>
                  <Text style={styles.activePlan}>{activeSubscription.plan}</Text>
                </View>
                <Text style={styles.activeAmount}>
                  GHS {activeSubscription.amount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.activeDetails}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="phone-portrait"
                    size={20}
                    color={colors.neutral.textSecondary}
                  />
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>
                    {activeSubscription.paymentMethod}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={colors.neutral.textSecondary}
                  />
                  <Text style={styles.detailLabel}>Next Payment</Text>
                  <Text style={styles.detailValue}>
                    {activeSubscription.nextPayment}
                  </Text>
                </View>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Choose a Plan Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Choose a Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Select the payment plan that works best for you
          </Text>
        </Animated.View>

        {/* Payment Plans */}
        {PAYMENT_PLANS.map((plan, index) => (
          <Animated.View
            key={plan.id}
            entering={FadeInDown.delay(300 + index * 50).springify()}
          >
            <LiquidGlassCard intensity="medium" className="mb-4">
              <Pressable style={styles.planCard}>
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={16} color={colors.neutral.pureWhite} />
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View
                    style={[styles.planIcon, { backgroundColor: plan.iconColor + "20" }]}
                  >
                    <Ionicons name={plan.icon} size={28} color={plan.iconColor} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>
                      GHS {plan.price.toFixed(2)}
                    </Text>
                    <Text style={styles.planFrequency}>{plan.frequency}</Text>
                  </View>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <View key={i} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.primary.blue}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </LiquidGlassCard>
          </Animated.View>
        ))}

        {/* Payment History */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <LiquidGlassCard intensity="medium" className="mb-6">
            <Pressable
              style={styles.historyButton}
              onPress={() => navigation.navigate("ReceiptHistory")}
            >
              <View style={styles.historyIcon}>
                <Ionicons name="receipt" size={24} color={colors.primary.blue} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>View All Receipts</Text>
                <Text style={styles.historySubtitle}>
                  Access your payment history
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.neutral.textSecondary}
              />
            </Pressable>
          </LiquidGlassCard>
        </Animated.View>

        <View style={{ height: 40 }} />
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
  activeSubscriptionCard: {
    padding: 20,
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkmarkIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.successGreen + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  activeInfo: {
    flex: 1,
  },
  activeLabel: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 4,
  },
  activePlan: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  activeAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "20",
    marginVertical: 16,
  },
  activeDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  planCard: {
    padding: 16,
  },
  popularBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: colors.accent.sunsetOrange,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popularText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    lineHeight: 18,
  },
  planPricing: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  planFrequency: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.neutral.textPrimary,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
});
