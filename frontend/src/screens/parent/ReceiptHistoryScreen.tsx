/**
 * Receipt History Screen
 * View historical payment receipts
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
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";

type TimeFilter = "all" | "week" | "month" | "year";

interface Receipt {
  id: string;
  number: string;
  amount: number;
  date: string;
  method: "Mobile Money" | "Cash Payment";
}

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: "1",
    number: "eceipt-1",
    amount: 150,
    date: "29 Nov 2025",
    method: "Mobile Money",
  },
  {
    id: "2",
    number: "eceipt-2",
    amount: 150,
    date: "22 Nov 2025",
    method: "Cash Payment",
  },
];

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

export default function ReceiptHistoryScreen() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("all");

  const totalSpent = MOCK_RECEIPTS.reduce((sum, r) => sum + r.amount, 0);

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
                <Text style={styles.receiptCountNumber}>{MOCK_RECEIPTS.length}</Text>
                <Text style={styles.receiptCountLabel}>Receipts</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Time Filters */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {TIME_FILTERS.map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[
                  styles.filterChip,
                  activeFilter === filter.key && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === filter.key && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Receipts List */}
        <View style={styles.receiptsList}>
          {MOCK_RECEIPTS.map((receipt, index) => (
            <Animated.View
              key={receipt.id}
              entering={FadeInDown.delay(300 + index * 50).springify()}
            >
              <LiquidGlassCard intensity="medium" className="mb-4">
                <Pressable style={styles.receiptCard}>
                  <View
                    style={[
                      styles.receiptIcon,
                      {
                        backgroundColor:
                          receipt.method === "Mobile Money"
                            ? colors.primary.blue + "20"
                            : colors.accent.successGreen + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        receipt.method === "Mobile Money"
                          ? "phone-portrait"
                          : "cash"
                      }
                      size={24}
                      color={
                        receipt.method === "Mobile Money"
                          ? colors.primary.blue
                          : colors.accent.successGreen
                      }
                    />
                  </View>

                  <View style={styles.receiptInfo}>
                    <Text style={styles.receiptNumber}>Receipt #{receipt.number}</Text>
                    <Text style={styles.receiptDate}>{receipt.date}</Text>
                    <Text style={styles.receiptMethod}>{receipt.method}</Text>
                  </View>

                  <View style={styles.receiptRight}>
                    <Text style={styles.receiptAmount}>
                      GHS {receipt.amount.toFixed(2)}
                    </Text>
                    <Pressable style={styles.shareButton}>
                      <Ionicons
                        name="share-outline"
                        size={20}
                        color={colors.primary.blue}
                      />
                    </Pressable>
                  </View>
                </Pressable>
              </LiquidGlassCard>
            </Animated.View>
          ))}
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
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.neutral.pureWhite,
    borderWidth: 1.5,
    borderColor: colors.neutral.textSecondary + "30",
  },
  filterChipActive: {
    backgroundColor: colors.primary.blue,
    borderColor: colors.primary.blue,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  filterChipTextActive: {
    color: colors.neutral.pureWhite,
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
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.blue + "15",
    alignItems: "center",
    justifyContent: "center",
  },
});
