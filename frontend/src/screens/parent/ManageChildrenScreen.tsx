/**
 * Manage Children Screen
 * View and manage children
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { Child } from "../../types";

type Props = NativeStackScreenProps<ParentStackParamList, "ManageChildren">;

export default function ManageChildrenScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChildren = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.get<Child[]>(`/children/parent/${user.id}`);
      console.log('[ManageChildren] Fetched children:', response);
      setChildren(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('[ManageChildren] Error fetching children:', error);
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChildren();
    setRefreshing(false);
  }, [user?.id]);

  // Fetch children when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [user?.id])
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Add Child Button */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Pressable onPress={() => navigation.navigate("AddChild")}>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.addChildCard}>
                <View style={styles.addIconCircle}>
                  <Ionicons name="add" size={28} color={colors.primary.blue} />
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

        {isLoading && children.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.blue} />
            <Text style={styles.loadingText}>Loading children...</Text>
          </View>
        ) : children.length === 0 ? (
          <LiquidGlassCard intensity="medium" className="mb-3">
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.neutral.textSecondary} />
              <Text style={styles.emptyText}>No children added yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add New Child" above to get started</Text>
            </View>
          </LiquidGlassCard>
        ) : (
          children.map((child, index) => {
            const fullName = `${child.firstName} ${child.lastName}`;
            const initials = fullName
              .split(" ")
              .map((n: string) => n[0])
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
                      <Text style={styles.childName}>{fullName}</Text>
                      <Text style={styles.childDetails}>
                        School: {child.school?.name || 'Not assigned'}
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <Pressable 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate("SetHomePickup", { childId: child.id })}
                      >
                        <Ionicons name="location" size={18} color={colors.primary.blue} />
                      </Pressable>
                      <Pressable style={styles.editButton}>
                        <Ionicons name="create-outline" size={20} color={colors.primary.blue} />
                      </Pressable>
                    </View>
                  </View>
                </LiquidGlassCard>
              </Animated.View>
            );
          })
        )}
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
    backgroundColor: colors.primary.blue + "20",
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
    backgroundColor: colors.primary.teal,
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
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.sunsetOrange + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.neutral.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
});
