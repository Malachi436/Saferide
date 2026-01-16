/**
 * Parent Sign Up Screen
 * Registration screen for new parent accounts
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

type RootStackParamList = {
  Login: undefined;
  ParentSignUp: undefined;
  ParentApp: undefined;
  DriverApp: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "ParentSignUp">;

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function ParentSignUpScreen({ navigation }: Props) {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignUpFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message
          ? Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message
          : 'Failed to create account';
        throw new Error(errorMessage);
      }

      Alert.alert(
        "Account Created!",
        "Your parent account has been created successfully. Please login to continue.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    field: keyof SignUpFormData,
    label: string,
    placeholder: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address" | "phone-pad";
      icon?: keyof typeof Ionicons.glyphMap;
    }
  ) => {
    const hasError = !!errors[field];

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
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
            style={[styles.input, options?.icon && styles.inputWithIcon]}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral.textSecondary + "80"}
            secureTextEntry={options?.secureTextEntry}
            keyboardType={options?.keyboardType || "default"}
            autoCapitalize={options?.secureTextEntry ? "none" : "words"}
            autoCorrect={false}
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
                <Ionicons name="person-add" size={48} color={colors.neutral.pureWhite} />
                <Text style={styles.headerTitle}>Create Parent Account</Text>
                <Text style={styles.headerSubtitle}>
                  Sign up to track your children and manage transportation
                </Text>
              </View>
            </Animated.View>

            {/* Sign Up Form */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <LiquidGlassCard intensity="heavy" className="mb-6">
                <View style={styles.formSection}>
                  {renderInput("firstName", "First Name", "Enter your first name", {
                    icon: "person",
                  })}
                  {renderInput("lastName", "Last Name", "Enter your last name", {
                    icon: "person",
                  })}
                  {renderInput("email", "Email", "your.email@example.com", {
                    icon: "mail",
                    keyboardType: "email-address",
                  })}
                  {renderInput("phone", "Phone Number", "+233 XX XXX XXXX", {
                    icon: "call",
                    keyboardType: "phone-pad",
                  })}
                  {renderInput("password", "Password", "Create a password", {
                    icon: "lock-closed",
                    secureTextEntry: true,
                  })}
                  {renderInput("confirmPassword", "Confirm Password", "Re-enter password", {
                    icon: "lock-closed",
                    secureTextEntry: true,
                  })}
                </View>
              </LiquidGlassCard>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <LargeCTAButton
                title={isSubmitting ? "Creating Account..." : "Create Account"}
                onPress={handleSignUp}
                disabled={isSubmitting}
                variant="success"
              />
            </Animated.View>

            {/* Back to Login */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate("Login")}
                >
                  Login here
                </Text>
              </View>
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
  errorText: {
    fontSize: 13,
    color: colors.status.danger,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral.warmCream,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
    textDecorationLine: "underline",
  },
});
