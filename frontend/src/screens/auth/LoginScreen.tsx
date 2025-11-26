/**
 * Login Screen
 * Authentication screen with email/password login and parent signup
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../state/authStore";
import { colors } from "../../theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { authService } from "../../api";
import { Parent, Driver } from "../../types/models";

type RootStackParamList = {
  Login: undefined;
  ParentSignUp: undefined;
  ParentApp: undefined;
  DriverApp: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // Call the real API for authentication
      const user = await authService.login({ email, password });
      
      // Create proper user object based on role
      if (user.role === "driver") {
        const driverUser: Driver & { accessToken: string; refreshToken: string } = {
          ...user,
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: "driver",
          licenseNumber: ""
        };
        login(driverUser);
        navigation.navigate("DriverApp");
      } else {
        const parentUser: Parent & { accessToken: string; refreshToken: string } = {
          ...user,
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: "parent",
          children: []
        };
        login(parentUser);
        navigation.navigate("ParentApp");
      }
    } catch (error) {
      Alert.alert("Error", "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.blue, colors.primary.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>ROSAgo</Text>
            </View>
            <Text style={styles.subtitle}>Premium School Transport</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.loginSection}>
            <LiquidGlassCard intensity="heavy">
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Login</Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email or Phone</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your.email@example.com"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.neutral.textSecondary + "80"}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Login Button */}
                <LargeCTAButton
                  title={isLoading ? "Logging in..." : "Login"}
                  onPress={handleLogin}
                  variant="primary"
                  disabled={isLoading}
                  style={styles.loginButton}
                />
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Sign Up Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.signupSection}>
            <LiquidGlassCard intensity="medium">
              <View style={styles.signupContainer}>
                <Text style={styles.signupTitle}>New Parent?</Text>
                <Text style={styles.signupSubtitle}>
                  Create an account to track your children and manage transportation
                </Text>
                <LargeCTAButton
                  title="Create Parent Account"
                  onPress={() => navigation.navigate("ParentSignUp")}
                  variant="success"
                  style={styles.signupButton}
                />
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Info Box */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={colors.neutral.creamWhite} />
            <Text style={styles.infoText}>
              Driver accounts are created by your company admin. Contact your administrator for login credentials.
            </Text>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.creamWhite,
    fontWeight: "500",
  },
  loginSection: {
    marginBottom: 20,
  },
  formContainer: {
    padding: 20,
    gap: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
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
  loginButton: {
    marginTop: 8,
  },
  signupSection: {
    marginBottom: 20,
  },
  signupContainer: {
    padding: 20,
    alignItems: "center",
  },
  signupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  signupSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  signupButton: {
    width: "100%",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral.creamWhite,
    lineHeight: 18,
  },
});