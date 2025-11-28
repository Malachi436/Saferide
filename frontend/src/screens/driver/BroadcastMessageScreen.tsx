/**
 * Broadcast Message Screen
 * Send messages to selected parents of children on the trip
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { mockTrip, mockChildren } from "../../mock/data";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

const QUICK_MESSAGES = [
  {
    id: "1",
    text: "Running 5 minutes late due to traffic",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "2",
    text: "All children have been picked up safely",
    icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "3",
    text: "Arriving at school in 10 minutes",
    icon: "location" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "4",
    text: "Trip completed. All children dropped off",
    icon: "flag" as keyof typeof Ionicons.glyphMap,
  },
];

export default function BroadcastMessageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // TODO: Replace with actual API call
  const trip = mockTrip;
  const childrenOnTrip = mockChildren.filter((c) => trip.childIds.includes(c.id));

  // Group children by parent
  const parentGroups = useMemo(() => {
    const groups: { [key: string]: typeof childrenOnTrip } = {};
    childrenOnTrip.forEach((child) => {
      if (!groups[child.parentId]) {
        groups[child.parentId] = [];
      }
      groups[child.parentId].push(child);
    });
    return groups;
  }, [childrenOnTrip]);

  const parentIds = Object.keys(parentGroups);
  const recipientCount = selectAll ? parentIds.length : selectedParentIds.length;

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!selectAll && selectedParentIds.length === 0) return;

    setIsSending(true);
    Keyboard.dismiss();

    // TODO: Replace with actual API call to send broadcast message
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSending(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigation.goBack();
    }, 2000);
  };

  const handleQuickMessage = (text: string) => {
    setMessage(text);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedParentIds([]);
    }
  };

  const toggleParentSelection = (parentId: string) => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedParentIds(parentIds.filter((id) => id !== parentId));
    } else {
      setSelectedParentIds((prev) => {
        if (prev.includes(parentId)) {
          return prev.filter((id) => id !== parentId);
        } else {
          const newSelection = [...prev, parentId];
          if (newSelection.length === parentIds.length) {
            setSelectAll(true);
            return [];
          }
          return newSelection;
        }
      });
    }
  };

  const isParentSelected = (parentId: string) => {
    return selectAll || selectedParentIds.includes(parentId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Info */}
          <View>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.headerCard}>
                <View style={styles.iconCircle}>
                  <Ionicons name="megaphone" size={28} color={colors.accent.sunsetOrange} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>Broadcast Message</Text>
                  <Text style={styles.headerSubtitle}>
                    Send to {recipientCount} parent{recipientCount !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>
          </View>

          {/* Quick Messages */}
          <View>
            <Text style={styles.sectionTitle}>Quick Messages</Text>
            <View style={styles.quickMessages}>
              {QUICK_MESSAGES.map((quickMsg, index) => (
                <View
                  key={quickMsg.id}
                  style={styles.quickMessageItem}
                >
                  <Pressable
                    onPress={() => handleQuickMessage(quickMsg.text)}
                    style={styles.quickMessageButton}
                  >
                    <LiquidGlassCard intensity="light">
                      <View style={styles.quickMessageContent}>
                        <Ionicons
                          name={quickMsg.icon}
                          size={20}
                          color={colors.primary.blue}
                        />
                        <Text style={styles.quickMessageText}>{quickMsg.text}</Text>
                      </View>
                    </LiquidGlassCard>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Custom Message */}
          <View>
            <Text style={styles.sectionTitle}>Custom Message</Text>
            <LiquidGlassCard intensity="medium">
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your message here..."
                  placeholderTextColor={colors.neutral.textSecondary}
                  multiline
                  numberOfLines={6}
                  value={message}
                  onChangeText={setMessage}
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>{message.length} / 500</Text>
                  {message.trim() && (
                    <Pressable onPress={() => setMessage("")} style={styles.clearButton}>
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={colors.neutral.textSecondary}
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            </LiquidGlassCard>
          </View>

          {/* Recipients Selection */}
          <View>
            <View style={styles.recipientHeader}>
              <Text style={styles.sectionTitle}>Select Recipients</Text>
              <Pressable onPress={toggleSelectAll} style={styles.selectAllButton}>
                <Ionicons
                  name={selectAll ? "checkbox" : "square-outline"}
                  size={20}
                  color={selectAll ? colors.primary.blue : colors.neutral.textSecondary}
                />
                <Text
                  style={[
                    styles.selectAllText,
                    selectAll && { color: colors.primary.blue },
                  ]}
                >
                  Select All
                </Text>
              </Pressable>
            </View>

            <LiquidGlassCard intensity="light">
              <View style={styles.recipientsCard}>
                {parentIds.map((parentId, index) => {
                  const children = parentGroups[parentId];
                  const isSelected = isParentSelected(parentId);

                  return (
                    <View
                      key={parentId}
                    >
                      <Pressable
                        onPress={() => toggleParentSelection(parentId)}
                        style={[
                          styles.parentItem,
                          index !== parentIds.length - 1 && styles.parentItemBorder,
                        ]}
                      >
                        <View style={styles.parentLeft}>
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.neutral.pureWhite}
                              />
                            )}
                          </View>
                          <View style={styles.parentInfo}>
                            <Text style={styles.parentName}>
                              Parent of {children[0].name.split(" ")[0]}
                              {children.length > 1 && ` (+${children.length - 1})`}
                            </Text>
                            <Text style={styles.childrenNames}>
                              {children.map((c) => c.name).join(", ")}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.childrenBadge}>
                          <Ionicons name="people" size={14} color={colors.primary.blue} />
                          <Text style={styles.childrenBadgeText}>{children.length}</Text>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </LiquidGlassCard>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.footer}>
          {showSuccess ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={24} color={colors.accent.successGreen} />
              <Text style={styles.successText}>Message sent successfully!</Text>
            </View>
          ) : (
            <LargeCTAButton
              title={isSending ? "Sending..." : "Send Message"}
              onPress={handleSend}
              variant="primary"
              disabled={!message.trim() || recipientCount === 0 || isSending}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.sunsetOrange + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  quickMessages: {
    gap: 12,
    marginBottom: 24,
  },
  quickMessageItem: {
    width: "100%",
  },
  quickMessageButton: {
    width: "100%",
  },
  quickMessageContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  quickMessageText: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral.textPrimary,
    fontWeight: "500",
  },
  inputCard: {
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: colors.neutral.textPrimary,
    minHeight: 120,
    marginBottom: 12,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  characterCount: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  clearButton: {
    padding: 4,
  },
  recipientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textSecondary,
  },
  recipientsCard: {
    padding: 8,
  },
  parentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  parentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.textSecondary + "20",
  },
  parentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary.blue,
    borderColor: colors.primary.blue,
  },
  parentInfo: {
    flex: 1,
    gap: 4,
  },
  parentName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  childrenNames: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  childrenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primary.blue + "20",
    borderRadius: 10,
  },
  childrenBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary.blue,
  },
  footer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: colors.neutral.pureWhite,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.textSecondary + "20",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.accent.successGreen + "20",
    borderRadius: 16,
    gap: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent.successGreen,
  },
});
