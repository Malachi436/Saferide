/**
 * Manage Children Screen
 * View and manage children
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { mockChildren } from "../../mock/data";
import { useAuthStore } from "../../state/authStore";

type Props = NativeStackScreenProps<ParentStackParamList, "ManageChildren">;

export default function ManageChildrenScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const children = mockChildren.filter((c) => c.parentId === user?.id);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Child Button */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Pressable onPress={() => navigation.navigate("AddChild")}>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.addChildCard}>
                <View style={styles.addIconCircle}>
                  <Ionicons name="add" size={28} color={colors.primary.yellow} />
                </View>
                <View style={styles.addChildText}>
                  <Text style={styles.addChildTitle}>Add New Child</Text>
                  <Text style={styles.addChildSubtitle}>
                    Register a new child to your account
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
              </View>
            </LiquidGlassCard>
          </Pressable>
        </Animated.View>

        {/* Children List */}
        <Text style={styles.sectionTitle}>Your Children ({children.length})</Text>

        {children.map((child, index) => {
          const initials = child.name
            .split(" ")
            .map((n) => n[0])
            .join("");

          return (
            <Animated.View
              key={child.id}
              entering={FadeInDown.delay(150 + index * 50).springify()}
            >
              <LiquidGlassCard intensity="medium" className="mb-3">
                <View style={styles.childCard}>
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>{initials}</Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childDetails}>
                      Status: {child.status}
                    </Text>
                  </View>
                  <Pressable style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color={colors.primary.yellow} />
                  </Pressable>
                </View>
              </LiquidGlassCard>
            </Animated.View>
          );
        })}
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
  addChildCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  addIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  addChildText: {
    flex: 1,
  },
  addChildTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  addChildSubtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  childAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.skyBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
  },
});
