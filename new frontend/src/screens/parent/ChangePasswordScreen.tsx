/**
 * Change Password Screen
 * Update account password
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
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

type Props = NativeStackScreenProps<ParentStackParamList, "ChangePassword">;

export default function ChangePasswordScreen({ navigation }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Validation Error", "Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="key" size={32} color={colors.status.warning} />
              </View>
              <Text style={styles.headerTitle}>Change Password</Text>
              <Text style={styles.headerSubtitle}>
                Enter your current password and choose a new one
              </Text>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.formSection}>
                {/* Current Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      secureTextEntry={!showCurrent}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                      <Ionicons
                        name={showCurrent ? "eye-off" : "eye"}
                        size={20}
                        color={colors.neutral.textSecondary}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                      <Ionicons
                        name={showNew ? "eye-off" : "eye"}
                        size={20}
                        color={colors.neutral.textSecondary}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.hint}>Must be at least 8 characters</Text>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowConfirm(!showConfirm)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off" : "eye"}
                        size={20}
                        color={colors.neutral.textSecondary}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <LargeCTAButton
              title={isSubmitting ? "Changing Password..." : "Change Password"}
              onPress={handleSubmit}
              disabled={isSubmitting}
              variant="primary"
            />
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.status.warning + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  formSection: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
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
  eyeIcon: {
    paddingHorizontal: 12,
  },
  hint: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
});
