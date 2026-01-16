/**
 * Link Child Screen
 * Parents link their account to children using unique school codes
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
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useAuth } from "../../state/AuthContext";
import { apiClient } from "../../api/client";

type Props = NativeStackScreenProps<ParentStackParamList, "LinkChild">;

interface LinkFormData {
  uniqueCode: string;
  allergies: string;
  medicalConditions: string;
  homeAddress: string;
}

export default function LinkChildScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LinkFormData>({
    uniqueCode: "",
    allergies: "",
    medicalConditions: "",
    homeAddress: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LinkFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof LinkFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LinkFormData, string>> = {};

    if (!formData.uniqueCode.trim()) {
      newErrors.uniqueCode = "Child code is required";
    } else if (formData.uniqueCode.trim().length < 5) {
      newErrors.uniqueCode = "Invalid code format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLinkChild = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/children/link", {
        uniqueCode: formData.uniqueCode.trim().toUpperCase(),
        allergies: formData.allergies.trim() || undefined,
        medicalConditions: formData.medicalConditions.trim() || undefined,
        homeAddress: formData.homeAddress.trim() || undefined,
      });

      Alert.alert(
        "Success!",
        `${response.data.firstName} ${response.data.lastName} has been linked to your account.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to link child. Please check the code and try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    field: keyof LinkFormData,
    label: string,
    placeholder: string,
    options?: {
      multiline?: boolean;
      icon?: keyof typeof Ionicons.glyphMap;
      required?: boolean;
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
    }
  ) => {
    const hasError = !!errors[field];

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          {options?.required && <Text style={styles.required}> *</Text>}
        </Text>
        <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
          {options?.icon && (
            <Ionicons
              name={options.icon}
              size={20}
              color={hasError ? colors.status.danger : colors.neutral.textSecondary}
              style={styles.inputIcon}
            />
          )}
          <TextInput
            style={[
              styles.input,
              options?.multiline && styles.inputMultiline,
              options?.icon && styles.inputWithIcon,
            ]}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral.textSecondary + "80"}
            autoCapitalize={options?.autoCapitalize || "none"}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 3 : 1}
          />
        </View>
        {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFD400", "#FFC800", "#FF6B35"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View style={styles.header}>
                <Ionicons
                  name="link"
                  size={48}
                  color={colors.neutral.pureWhite}
                />
                <Text style={styles.headerTitle}>Link Child</Text>
                <Text style={styles.headerSubtitle}>
                  Enter the unique code provided by your child's school to link them to your account
                </Text>
              </View>
            </Animated.View>

            {/* Link Form */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <LiquidGlassCard intensity="heavy" className="mb-6">
                <View style={styles.formSection}>
                  {renderInput(
                    "uniqueCode",
                    "Child Code",
                    "e.g., TSC-ABC123",
                    {
                      icon: "key",
                      required: true,
                      autoCapitalize: "characters",
                    }
                  )}

                  {renderInput(
                    "allergies",
                    "Allergies",
                    "Enter any known allergies (optional)",
                    {
                      icon: "warning",
                      multiline: true,
                      autoCapitalize: "sentences",
                    }
                  )}

                  {renderInput(
                    "medicalConditions",
                    "Medical Conditions",
                    "Enter any known medical conditions (optional)",
                    {
                      icon: "medkit",
                      multiline: true,
                      autoCapitalize: "sentences",
                    }
                  )}

                  {renderInput(
                    "homeAddress",
                    "Home Address",
                    "Enter your home address (optional)",
                    {
                      icon: "home",
                      multiline: true,
                      autoCapitalize: "words",
                    }
                  )}

                  {/* Info Box */}
                  <View style={styles.infoBox}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={colors.primary.honeyGold}
                    />
                    <Text style={styles.infoText}>
                      Your child's code is available from your school administrator. If you don't have it, please contact the school.
                    </Text>
                  </View>
                </View>
              </LiquidGlassCard>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <LargeCTAButton
                title={isSubmitting ? "Linking..." : "Link Child"}
                onPress={handleLinkChild}
                disabled={isSubmitting}
                variant="success"
              />
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.neutral.warmCream,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  required: {
    color: colors.status.danger,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral.textSecondary + "30",
    overflow: "hidden",
  },
  inputWrapperError: {
    borderColor: colors.status.danger,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.neutral.textPrimary,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 13,
    color: colors.status.danger,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: colors.primary.honeyGold + "15",
    borderRadius: 8,
    gap: 10,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral.textPrimary,
    lineHeight: 18,
  },
});
