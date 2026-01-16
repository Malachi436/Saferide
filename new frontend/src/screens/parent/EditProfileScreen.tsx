/**
 * Edit Profile Screen
 * Edit parent profile information
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
import { useAuthStore } from "../../state/authStore";

type Props = NativeStackScreenProps<ParentStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
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
          {/* Avatar Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <Text style={styles.changePhotoText}>Tap to change photo</Text>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(value) => setFormData((p) => ({ ...p, name: value }))}
                      placeholder="Enter your full name"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(value) => setFormData((p) => ({ ...p, email: value }))}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="call"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.phone}
                      onChangeText={(value) => setFormData((p) => ({ ...p, phone: value }))}
                      placeholder="+233 XX XXX XXXX"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <LargeCTAButton
              title={isSubmitting ? "Saving..." : "Save Changes"}
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  changePhotoText: {
    fontSize: 14,
    color: colors.primary.yellow,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
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
});
