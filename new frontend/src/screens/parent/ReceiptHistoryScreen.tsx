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
  Modal,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useAuthStore } from "../../state/authStore";
import { mockReceipts, mockChildren } from "../../mock/data";
import { Receipt } from "../../types/models";

type Props = NativeStackScreenProps<ParentStackParamList, "ReceiptHistory">;

type FilterType = "all" | "week" | "month" | "year";

export default function ReceiptHistoryScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // TODO: Replace with actual API call
  const receipts = mockReceipts.filter((r) => r.parentId === user?.id);
  const children = mockChildren.filter((c) => c.parentId === user?.id);

  // Filter receipts by time period
  const filteredReceipts = receipts.filter((receipt) => {
    const receiptDate = new Date(receipt.date);
    const now = new Date();

    switch (selectedFilter) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return receiptDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return receiptDate >= monthAgo;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return receiptDate >= yearAgo;
      default:
        return true;
    }
  });

  // Calculate total spending
  const totalSpent = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const handleShareReceipt = async (receipt: Receipt) => {
    try {
      await Share.share({
        message: `Receipt #${receipt.id}\nAmount: ${formatCurrency(receipt.amount)}\nDate: ${formatDate(receipt.date)}\nMethod: ${receipt.method === "momo" ? "Mobile Money" : "Cash"}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getMethodIcon = (method: "momo" | "cash") => {
    return method === "momo" ? "phone-portrait" : "cash";
  };

  const getMethodColor = (method: "momo" | "cash") => {
    return method === "momo" ? colors.accent.skyBlue : colors.status.success;
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All Time" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LiquidGlassCard intensity="heavy">
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="wallet" size={28} color={colors.primary.yellow} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
                <Text style={styles.summaryPeriod}>
                  {selectedFilter === "all"
                    ? "All time"
                    : selectedFilter === "week"
                    ? "Last 7 days"
                    : selectedFilter === "month"
                    ? "Last 30 days"
                    : "Last 365 days"}
                </Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statValue}>{filteredReceipts.length}</Text>
                  <Text style={styles.statLabel}>Receipts</Text>
                </View>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter, index) => (
          <Animated.View key={filter.key} entering={FadeInDown.delay(150 + index * 50).springify()}>
            <Pressable
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Receipts List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredReceipts.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={64} color={colors.neutral.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No Receipts Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === "all"
                ? "You have no payment receipts yet"
                : `No receipts found for ${filters.find((f) => f.key === selectedFilter)?.label.toLowerCase()}`}
            </Text>
          </Animated.View>
        ) : (
          filteredReceipts.map((receipt, index) => (
            <Animated.View
              key={receipt.id}
              entering={FadeInDown.delay(300 + index * 50).springify()}
            >
              <Pressable onPress={() => handleViewReceipt(receipt)} style={styles.receiptCard}>
                <LiquidGlassCard intensity="medium">
                  <View style={styles.receiptContent}>
                    <View style={styles.receiptLeft}>
                      <View
                        style={[
                          styles.receiptIcon,
                          { backgroundColor: getMethodColor(receipt.method) + "20" },
                        ]}
                      >
                        <Ionicons
                          name={getMethodIcon(receipt.method)}
                          size={24}
                          color={getMethodColor(receipt.method)}
                        />
                      </View>
                      <View style={styles.receiptInfo}>
                        <Text style={styles.receiptId}>Receipt #{receipt.id.slice(-8)}</Text>
                        <Text style={styles.receiptDate}>{formatDate(receipt.date)}</Text>
                        <View style={styles.receiptMethod}>
                          <Text style={styles.receiptMethodText}>
                            {receipt.method === "momo" ? "Mobile Money" : "Cash Payment"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.receiptRight}>
                      <Text style={styles.receiptAmount}>{formatCurrency(receipt.amount)}</Text>
                      <Pressable
                        onPress={() => handleShareReceipt(receipt)}
                        style={styles.shareButton}
                      >
                        <Ionicons name="share-outline" size={20} color={colors.primary.yellow} />
                      </Pressable>
                    </View>
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Receipt Detail Modal */}
      <Modal
        visible={showReceiptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receipt Details</Text>
              <Pressable
                onPress={() => setShowReceiptModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.neutral.textPrimary} />
              </Pressable>
            </View>

            {selectedReceipt && (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Receipt Header */}
                <View style={styles.receiptHeader}>
                  <View style={styles.receiptHeaderIcon}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.status.success} />
                  </View>
                  <Text style={styles.receiptHeaderTitle}>Payment Successful</Text>
                  <Text style={styles.receiptHeaderAmount}>
                    {formatCurrency(selectedReceipt.amount)}
                  </Text>
                </View>

                {/* Receipt Details */}
                <View style={styles.receiptDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Receipt ID</Text>
                    <Text style={styles.detailValue}>#{selectedReceipt.id}</Text>
                  </View>
                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment ID</Text>
                    <Text style={styles.detailValue}>#{selectedReceipt.paymentId}</Text>
                  </View>
                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedReceipt.date)}</Text>
                  </View>
                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{formatTime(selectedReceipt.date)}</Text>
                  </View>
                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <View style={styles.detailMethodValue}>
                      <Ionicons
                        name={getMethodIcon(selectedReceipt.method)}
                        size={16}
                        color={colors.neutral.textSecondary}
                      />
                      <Text style={styles.detailValue}>
                        {selectedReceipt.method === "momo" ? "Mobile Money" : "Cash"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={[styles.detailValue, styles.detailAmountValue]}>
                      {formatCurrency(selectedReceipt.amount)}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.receiptActions}>
                  <Pressable
                    onPress={() => handleShareReceipt(selectedReceipt)}
                    style={styles.actionButton}
                  >
                    <LiquidGlassCard intensity="medium">
                      <View style={styles.actionButtonContent}>
                        <Ionicons name="share-outline" size={24} color={colors.primary.yellow} />
                        <Text style={styles.actionButtonText}>Share Receipt</Text>
                      </View>
                    </LiquidGlassCard>
                  </Pressable>
                </View>

                {/* Footer Note */}
                <View style={styles.receiptFooter}>
                  <Text style={styles.footerText}>
                    Thank you for using Saferide! For any queries regarding this receipt, please
                    contact support.
                  </Text>
                </View>
              </ScrollView>
            )}
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
  summaryContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.yellow + "20",
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
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  summaryStats: {
    alignItems: "center",
  },
  statBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary.yellow + "20",
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary.yellow,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.primary.yellow,
    fontWeight: "600",
  },
  filterContainer: {
    maxHeight: 50,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral.pureWhite,
    borderWidth: 1.5,
    borderColor: colors.neutral.textSecondary + "30",
  },
  filterChipActive: {
    backgroundColor: colors.primary.yellow,
    borderColor: colors.primary.yellow,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textSecondary,
  },
  filterChipTextActive: {
    color: colors.neutral.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral.textSecondary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  receiptCard: {
    marginBottom: 12,
  },
  receiptContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  receiptLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  receiptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptInfo: {
    flex: 1,
  },
  receiptId: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 4,
  },
  receiptMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  receiptMethodText: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  receiptRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  shareButton: {
    padding: 4,
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
  },
  receiptHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.status.success + "10",
  },
  receiptHeaderIcon: {
    marginBottom: 16,
  },
  receiptHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  receiptHeaderAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.status.success,
  },
  receiptDetails: {
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  detailMethodValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailAmountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "10",
  },
  receiptActions: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.yellow,
  },
  receiptFooter: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
