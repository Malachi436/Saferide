/**
 * LoginScreen - SafeRide UI
 * Matches the yellow gradient design with glass morphism cards
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { LargeCTAButton, LiquidCard } from '../components';
import { UserRole } from '../types';
import { colors } from '../theme';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.yellow, colors.primary.darkYellow, colors.accent.safetyOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Saferide</Text>
            </View>
            <Text style={styles.subtitle}>Premium School Transport</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginSection}>
            <LiquidCard intensity="heavy">
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
                  title={isLoading ? "Logging in..." : "LOGIN"}
                  onPress={handleLogin}
                  variant="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.loginButton}
                />
              </View>
            </LiquidCard>
          </View>

          {/* Sign Up Section - Only show for parents */}
          {role === 'parent' && (
            <View style={styles.signupSection}>
              <LiquidCard intensity="medium">
                <View style={styles.signupContainer}>
                  <Text style={styles.signupTitle}>New Parent?</Text>
                  <Text style={styles.signupSubtitle}>
                    Create an account to track your children and manage transportation
                  </Text>
                  <LargeCTAButton
                    title="CREATE PARENT"
                    onPress={() => navigation.navigate('ParentSignUp' as never)}
                    variant="success"
                    style={styles.signupButton}
                  />
                </View>
              </LiquidCard>
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={colors.neutral.warmCream} />
            <Text style={styles.infoText}>
              Driver accounts are created by your company admin. Contact your administrator for login credentials.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.neutral.pureWhite,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.warmCream,
    fontWeight: '500',
  },
  loginSection: {
    marginBottom: 20,
  },
  formContainer: {
    padding: 4,
    gap: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral.textSecondary + '30',
    overflow: 'hidden',
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
    padding: 4,
    alignItems: 'center',
  },
  signupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  signupSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  signupButton: {
    width: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral.warmCream,
    lineHeight: 18,
  },
});
