/**
 * Payments Screen
 * Connect to real backend payment API
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type Props = NativeStackScreenProps<ParentStackParamList, "Payments">;

interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  hubtleRef?: string;
}

interface PaymentPlan {
  id: string;
  companyId: string;
  name: string;
  amount: number;
  frequency: string;
  description?: string;
  features?: string[];
  isActive: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return colors.accent.successGreen;
    case 'pending':
      return colors.status.warningYellow;
    case 'failed':
      return colors.status.dangerRed;
    default:
      return colors.neutral.textSecondary;
  }
};

const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
  switch (status) {
    case 'completed':
      return 'checkmark-circle';
    case 'pending':
      return 'time';
    case 'failed':
      return 'alert-circle';
    default:
      return 'help-circle';
  }
};

export default function PaymentsScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentPlans();
  }, [user?.id]);

  const getCompanyId = async () => {
    try {
      // Get company ID from first child's school
      const childrenResponse = await apiClient.get<any[]>(`/children/parent/${user?.id}`);
      if (Array.isArray(childrenResponse) && childrenResponse.length > 0) {
        const firstChild = childrenResponse[0];
        // Fetch school to get company ID
        const schoolResponse = await apiClient.get<any>(`/schools/${firstChild.schoolId}`);
        return schoolResponse.companyId;
      }
    } catch (err) {
      console.log('[PaymentsScreen] Error getting company ID:', err);
    }
    return null;
  };

  const fetchPaymentPlans = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get company ID first
      const cId = await getCompanyId();
      if (!cId) {
        setPaymentPlans([]);
        return;
      }
      
      setCompanyId(cId);
      
      // Fetch payment plans for this company
      const plansResponse = await apiClient.get<PaymentPlan[]>(`/payment-plans/company/${cId}`);
      setPaymentPlans(Array.isArray(plansResponse) ? plansResponse : []);
      
      // Also fetch payment history
      const historyResponse = await apiClient.get<PaymentHistoryItem[]>(`/payments/history/${user.id}`);
      setPayments(Array.isArray(historyResponse) ? historyResponse : []);
    } catch (err: any) {
      console.log('[PaymentsScreen] Error fetching data:', err);
      setError('Failed to load payment information');
      setPaymentPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePayment = async (amount: number) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await apiClient.post('/payments/create-intent', {
        parentId: user.id,
        amount,
        currency: 'GHS',
      }) as any;
      
      Alert.alert(
        'Payment Intent Created',
        `Payment ID: ${response.id}\nAmount: GHS ${amount}\n\nYou will receive a prompt on your phone to confirm payment`,
        [{ text: 'OK', onPress: fetchPaymentPlans }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create payment';
      Alert.alert('Error', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LiquidGlassCard intensity="medium" className="mb-6">
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryLabel}>Total Paid</Text>
                  <Text style={styles.summaryAmount}>GHS {totalPaid.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Pending</Text>
                  <Text style={[styles.summaryAmount, { color: colors.status.warningYellow }]}>
                    GHS {pendingAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Payment Plans from Company */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          {paymentPlans.length === 0 ? (
            <LiquidGlassCard>
              <Text style={styles.emptyText}>No payment plans available</Text>
            </LiquidGlassCard>
          ) : (
            <View style={styles.plansGrid}>
              {paymentPlans.map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => handleMakePayment(plan.amount)}
                  disabled={isProcessing}
                  style={({ pressed }) => [
                    styles.planCard,
                    pressed && styles.planCardPressed,
                  ]}
                >
                  <LiquidGlassCard intensity="medium" className="h-full">
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>GHS {plan.amount}</Text>
                    <Text style={styles.planFrequency}>/{plan.frequency}</Text>
                    {plan.description && (
                      <Text style={styles.planDescription}>{plan.description}</Text>
                    )}
                    {plan.features && plan.features.length > 0 && (
                      <View style={styles.planFeatures}>
                        {plan.features.slice(0, 2).map((feature, i) => (
                          <Text key={i} style={styles.planFeature}>✓ {feature}</Text>
                        ))}
                      </View>
                    )}
                  </LiquidGlassCard>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Payment History */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator color={colors.primary.blue} size="large" />
            </View>
          ) : error ? (
            <LiquidGlassCard>
              <Text style={styles.errorText}>{error}</Text>
            </LiquidGlassCard>
          ) : payments.length === 0 ? (
            <LiquidGlassCard>
              <Text style={styles.emptyText}>No payment history yet</Text>
            </LiquidGlassCard>
          ) : (
            payments.map((payment, index) => (
              <Animated.View
                key={payment.id}
                entering={FadeInDown.delay(250 + index * 30).springify()}
              >
                <LiquidGlassCard className="mb-3">
                  <View style={styles.paymentRow}>
                    <View style={styles.paymentIcon}>
                      <Ionicons
                        name={getStatusIcon(payment.status)}
                        size={24}
                        color={getStatusColor(payment.status)}
                      />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAmount}>GHS {payment.amount.toFixed(2)}</Text>
                      <Text style={styles.paymentDate}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.paymentStatus}>
                      <Text
                        style={[
                          styles.statusBadge,
                          { color: getStatusColor(payment.status) },
                        ]}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </LiquidGlassCard>
              </Animated.View>
            ))
          )}
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
  centerContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.blue,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    minWidth: '45%',
    minHeight: 180,
  },
  planCardPressed: {
    opacity: 0.7,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.blue,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  planFrequency: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginBottom: 8,
  },
  planFeatures: {
    marginTop: 8,
    gap: 4,
  },
  planFeature: {
    fontSize: 11,
    color: colors.accent.successGreen,
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.creamWhite,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.dangerRed,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
