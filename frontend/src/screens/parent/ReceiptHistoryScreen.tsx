/**
 * Receipt History Screen
 * View historical payment receipts from backend
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  hubtleRef?: string;
}

export default function ReceiptHistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [user?.id]);

  const fetchPayments = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.get<Payment[]>(
        `/payments/history/${user.id}`
      );
      setPayments(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.log('[ReceiptHistory] Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const completedPayments = payments.filter((p) => p.status === 'completed');
  const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={32} color={colors.primary.blue} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryAmount}>
                  GHS {totalSpent.toFixed(2)}
                </Text>
                <Text style={styles.summaryPeriod}>All time</Text>
              </View>
              <View style={styles.receiptCount}>
                <Text style={styles.receiptCountNumber}>
                  {completedPayments.length}
                </Text>
                <Text style={styles.receiptCountLabel}>Payments</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Filter Note */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.filterNote}>
            <Text style={styles.filterNoteText}>
              Showing all completed payments
            </Text>
          </View>
        </Animated.View>

        {/* Payments List */}
        <View style={styles.receiptsList}>
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator color={colors.primary.blue} size="large" />
            </View>
          ) : completedPayments.length === 0 ? (
            <LiquidGlassCard>
              <Text style={styles.emptyText}>No completed payments yet</Text>
            </LiquidGlassCard>
          ) : (
            completedPayments.map((payment, index) => (
              <Animated.View
                key={payment.id}
                entering={FadeInDown.delay(300 + index * 50).springify()}
              >
                <LiquidGlassCard intensity="medium" className="mb-4">
                  <Pressable style={styles.receiptCard}>
                    <View style={[styles.receiptIcon, { backgroundColor: colors.primary.blue + "20" }]}>
                      <Ionicons
                        name="card"
                        size={24}
                        color={colors.primary.blue}
                      />
                    </View>

                    <View style={styles.receiptInfo}>
                      <Text style={styles.receiptNumber}>
                        Payment ID: {payment.id.slice(0, 8)}
                      </Text>
                      <Text style={styles.receiptDate}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={styles.receiptMethod}>Via Payment Gateway</Text>
                    </View>

                    <View style={styles.receiptRight}>
                      <Text style={styles.receiptAmount}>
                        GHS {payment.amount.toFixed(2)}
                      </Text>
                    </View>
                  </Pressable>
                </LiquidGlassCard>
              </Animated.View>
            ))
          )}
        </View>

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
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  walletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  summaryPeriod: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  receiptCount: {
    backgroundColor: colors.primary.blue + "15",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  receiptCountNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary.blue,
    marginBottom: 2,
  },
  receiptCountLabel: {
    fontSize: 12,
    color: colors.primary.blue,
    fontWeight: "600",
  },
  filterNote: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary.blue + "10",
    borderRadius: 12,
    marginBottom: 20,
  },
  filterNoteText: {
    fontSize: 14,
    color: colors.primary.blue,
    fontWeight: "500",
  },
  receiptsList: {
    gap: 0,
  },
  receiptCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  receiptIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptInfo: {
    flex: 1,
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 2,
  },
  receiptMethod: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  receiptRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
});
