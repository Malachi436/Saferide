/**
 * Payments Screen
 * Manage and make payments for bus service
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useAuthStore } from "../../state/authStore";
import { mockChildren, mockPayments } from "../../mock/data";
import { PaymentMethod } from "../../types/models";

type Props = NativeStackScreenProps<ParentStackParamList, "Payments">;

interface PaymentPlan {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  amount: number;
  description: string;
}

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: "daily",
    name: "Daily Plan",
    frequency: "daily",
    amount: 25,
    description: "Pay per trip, daily",
  },
  {
    id: "weekly",
    name: "Weekly Plan",
    frequency: "weekly",
    amount: 150,
    description: "5% discount - Best for regular use",
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    frequency: "monthly",
    amount: 500,
    description: "15% discount - Best value",
  },
];

export default function PaymentsScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [momoNumber, setMomoNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // TODO: Replace with actual API call
  const userChildren = mockChildren.filter((c) => c.parentId === user?.id);
  const payments = mockPayments.filter((p) => p.parentId === user?.id);

  // Get active subscription info
  const activeSubscription = payments.find((p) => p.status === "completed");

  const handleSelectPlan = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedChild) {
      Alert.alert("Error", "Please select a child");
      return;
    }

    if (paymentMethod === "momo" && !momoNumber.trim()) {
      Alert.alert("Error", "Please enter your mobile money number");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowPaymentModal(false);
      setIsProcessing(false);

      Alert.alert(
        "Payment Successful",
        `Your ${selectedPlan.frequency} subscription has been activated!`,
        [
          {
            text: "View Receipt",
            onPress: () => navigation.navigate("ReceiptHistory"),
          },
          {
            text: "OK",
          },
        ]
      );

      // Reset form
      setSelectedPlan(null);
      setSelectedChild("");
      setMomoNumber("");
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Payment Failed", "Please try again");
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toFixed(2)}`;
  };

  const calculateSavings = (plan: PaymentPlan) => {
    const dailyRate = 25;
    let daysInPeriod = 1;

    if (plan.frequency === "weekly") {
      daysInPeriod = 5; // 5 school days
    } else if (plan.frequency === "monthly") {
      daysInPeriod = 20; // ~20 school days
    }

    const regularPrice = dailyRate * daysInPeriod;
    const savings = regularPrice - plan.amount;

    return savings > 0 ? savings : 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Subscription Card */}
        {activeSubscription && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LiquidGlassCard intensity="heavy" className="mb-4">
              <View style={styles.activeSubscriptionCard}>
                <View style={styles.activeSubHeader}>
                  <View style={styles.activeSubIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
                  </View>
                  <View style={styles.activeSubInfo}>
                    <Text style={styles.activeSubTitle}>Active Subscription</Text>
                    <Text style={styles.activeSubPlan}>
                      {activeSubscription.frequency.charAt(0).toUpperCase() +
                        activeSubscription.frequency.slice(1)}{" "}
                      Plan
                    </Text>
                  </View>
                  <Text style={styles.activeSubAmount}>
                    {formatCurrency(activeSubscription.amount)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.activeSubDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <View style={styles.detailValue}>
                      <Ionicons
                        name={activeSubscription.method === "momo" ? "phone-portrait" : "cash"}
                        size={16}
                        color={colors.neutral.textSecondary}
                      />
                      <Text style={styles.detailText}>
                        {activeSubscription.method === "momo" ? "Mobile Money" : "Cash"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Payment</Text>
                    <Text style={styles.detailText}>
                      {new Date(
                        new Date(activeSubscription.date).getTime() +
                          (activeSubscription.frequency === "weekly"
                            ? 7
                            : activeSubscription.frequency === "monthly"
                            ? 30
                            : 1) *
                            24 *
                            60 *
                            60 *
                            1000
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </LiquidGlassCard>
          </Animated.View>
        )}

        {/* Payment Plans */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Choose a Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Select the payment plan that works best for you
          </Text>
        </Animated.View>

        {PAYMENT_PLANS.map((plan, index) => {
          const savings = calculateSavings(plan);
          const isPopular = plan.frequency === "weekly";

          return (
            <Animated.View
              key={plan.id}
              entering={FadeInDown.delay(200 + index * 50).springify()}
            >
              <Pressable onPress={() => handleSelectPlan(plan)} style={styles.planCard}>
                <LiquidGlassCard intensity={isPopular ? "heavy" : "medium"}>
                  <View style={styles.planContent}>
                    <View style={styles.planTopRow}>
                      <View style={{ flex: 1 }} />
                      {isPopular && (
                        <View style={styles.popularBadge}>
                          <Ionicons name="star" size={12} color={colors.neutral.pureWhite} />
                          <Text style={styles.popularText}>POPULAR</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.planHeader}>
                      <View style={styles.planLeft}>
                        <View
                          style={[
                            styles.planIcon,
                            {
                              backgroundColor:
                                plan.frequency === "daily"
                                  ? colors.status.info + "20"
                                  : plan.frequency === "weekly"
                                  ? colors.accent.safetyOrange + "20"
                                  : colors.status.success + "20",
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              plan.frequency === "daily"
                                ? "calendar"
                                : plan.frequency === "weekly"
                                ? "calendar-outline"
                                : "calendar-clear"
                            }
                            size={24}
                            color={
                              plan.frequency === "daily"
                                ? colors.status.info
                                : plan.frequency === "weekly"
                                ? colors.accent.safetyOrange
                                : colors.status.success
                            }
                          />
                        </View>
                        <View style={styles.planInfo}>
                          <Text style={styles.planName}>{plan.name}</Text>
                          <Text style={styles.planDescription}>{plan.description}</Text>
                        </View>
                      </View>
                      <View style={styles.planPricing}>
                        <Text style={styles.planAmount}>{formatCurrency(plan.amount)}</Text>
                        <Text style={styles.planFrequency}>/{plan.frequency}</Text>
                      </View>
                    </View>

                    {savings > 0 && (
                      <View style={styles.savingsRow}>
                        <Ionicons name="trending-down" size={16} color={colors.status.success} />
                        <Text style={styles.savingsText}>
                          Save {formatCurrency(savings)} per {plan.frequency}
                        </Text>
                      </View>
                    )}

                    <View style={styles.planFeatures}>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary.yellow} />
                        <Text style={styles.featureText}>
                          {plan.frequency === "daily"
                            ? "Pay as you go"
                            : plan.frequency === "weekly"
                            ? "5 school days covered"
                            : "~20 school days covered"}
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary.yellow} />
                        <Text style={styles.featureText}>Real-time tracking</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary.yellow} />
                        <Text style={styles.featureText}>SMS notifications</Text>
                      </View>
                    </View>
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <Pressable
            onPress={() => navigation.navigate("ReceiptHistory")}
            style={styles.actionButton}
          >
            <LiquidGlassCard intensity="medium">
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="receipt" size={24} color={colors.accent.skyBlue} />
                  </View>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>View All Receipts</Text>
                    <Text style={styles.actionSubtitle}>Access your payment history</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </View>
            </LiquidGlassCard>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <Pressable
                onPress={() => setShowPaymentModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.neutral.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Plan Summary */}
              {selectedPlan && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Selected Plan</Text>
                  <View style={styles.planSummary}>
                    <Text style={styles.planSummaryName}>{selectedPlan.name}</Text>
                    <Text style={styles.planSummaryAmount}>
                      {formatCurrency(selectedPlan.amount)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Child Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Select Child</Text>
                {userChildren.map((child) => (
                  <Pressable
                    key={child.id}
                    onPress={() => setSelectedChild(child.id)}
                    style={[
                      styles.childOption,
                      selectedChild === child.id && styles.childOptionSelected,
                    ]}
                  >
                    <View style={styles.childOptionContent}>
                      <View style={styles.childAvatar}>
                        <Text style={styles.childAvatarText}>
                          {child.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Text>
                      </View>
                      <Text style={styles.childOptionName}>{child.name}</Text>
                    </View>
                    {selectedChild === child.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary.yellow} />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Payment Method */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  <Pressable
                    onPress={() => setPaymentMethod("momo")}
                    style={[
                      styles.paymentMethodCard,
                      paymentMethod === "momo" && styles.paymentMethodCardActive,
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait"
                      size={24}
                      color={paymentMethod === "momo" ? colors.primary.yellow : colors.neutral.textSecondary}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === "momo" && styles.paymentMethodTextActive,
                      ]}
                    >
                      Mobile Money
                    </Text>
                    {paymentMethod === "momo" && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary.yellow} />
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => setPaymentMethod("cash")}
                    style={[
                      styles.paymentMethodCard,
                      paymentMethod === "cash" && styles.paymentMethodCardActive,
                    ]}
                  >
                    <Ionicons
                      name="cash"
                      size={24}
                      color={paymentMethod === "cash" ? colors.primary.yellow : colors.neutral.textSecondary}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === "cash" && styles.paymentMethodTextActive,
                      ]}
                    >
                      Cash
                    </Text>
                    {paymentMethod === "cash" && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary.yellow} />
                    )}
                  </Pressable>
                </View>

                {paymentMethod === "momo" && (
                  <View style={styles.momoInput}>
                    <Text style={styles.inputLabel}>Mobile Money Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="call"
                        size={20}
                        color={colors.neutral.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={momoNumber}
                        onChangeText={setMomoNumber}
                        placeholder="+233 XX XXX XXXX"
                        placeholderTextColor={colors.neutral.textSecondary + "80"}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.modalFooter}>
              <LargeCTAButton
                title={isProcessing ? "Processing..." : `Pay ${selectedPlan ? formatCurrency(selectedPlan.amount) : ""}`}
                onPress={handlePayment}
                disabled={isProcessing || !selectedChild}
                variant="success"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  activeSubscriptionCard: {
    padding: 20,
  },
  activeSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeSubIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.status.success + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  activeSubInfo: {
    flex: 1,
  },
  activeSubTitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 4,
  },
  activeSubPlan: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  activeSubAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "20",
    marginVertical: 16,
  },
  activeSubDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  detailValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
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
  },
  planCard: {
    marginBottom: 16,
  },
  planContent: {
    padding: 16,
  },
  planTopRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    minHeight: 24,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.accent.safetyOrange,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  planLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  planAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  planFrequency: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.status.success + "20",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.status.success,
  },
  planFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  actionButton: {
    marginTop: 8,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.skyBlue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.neutral.pureWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.textSecondary + "20",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.warmCream,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  planSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.primary.yellow + "10",
    borderRadius: 12,
  },
  planSummaryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  planSummaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  childOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.neutral.warmCream,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  childOptionSelected: {
    borderColor: colors.primary.yellow,
    backgroundColor: colors.primary.yellow + "10",
  },
  childOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  childOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.neutral.warmCream,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 12,
  },
  paymentMethodCardActive: {
    borderColor: colors.primary.yellow,
    backgroundColor: colors.primary.yellow + "10",
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textSecondary,
  },
  paymentMethodTextActive: {
    color: colors.primary.yellow,
  },
  momoInput: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral.textSecondary + "30",
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.neutral.textPrimary,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.textSecondary + "20",
  },
});
