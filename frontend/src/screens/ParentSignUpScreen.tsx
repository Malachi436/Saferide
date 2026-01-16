/**
 * ParentSignUpScreen - SafeRide UI
 * Registration screen for new parent accounts with validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { LargeCTAButton, LiquidCard } from '../components';
import { colors } from '../theme';

export const ParentSignUpScreen = () => {
  const navigation = useNavigation();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({ name, email, phone, password });
    } catch (error) {
      console.error('Sign up failed:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="person-add" size={48} color={colors.neutral.pureWhite} />
              <Text style={styles.headerTitle}>Create Parent Account</Text>
              <Text style={styles.headerSubtitle}>
                Sign up to track your children and manage transportation
              </Text>
            </View>

            {/* Sign Up Form */}
            <View style={styles.formSection}>
              <LiquidCard intensity="heavy">
                <View style={styles.formContainer}>
                  {/* Full Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={[styles.inputWrapper, errors.name && styles.inputWrapperError]}>
                      <Ionicons
                        name="person"
                        size={20}
                        color={errors.name ? colors.status.danger : colors.neutral.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.neutral.textSecondary + '80'}
                        value={name}
                        onChangeText={(text) => {
                          setName(text);
                          clearError('name');
                        }}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                      <Ionicons
                        name="mail"
                        size={20}
                        color={errors.email ? colors.status.danger : colors.neutral.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.neutral.textSecondary + '80'}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          clearError('email');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                  </View>

                  {/* Phone */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <View style={[styles.inputWrapper, errors.phone && styles.inputWrapperError]}>
                      <Ionicons
                        name="call"
                        size={20}
                        color={errors.phone ? colors.status.danger : colors.neutral.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="+233 XX XXX XXXX"
                        placeholderTextColor={colors.neutral.textSecondary + '80'}
                        value={phone}
                        onChangeText={(text) => {
                          setPhone(text);
                          clearError('phone');
                        }}
                        keyboardType="phone-pad"
                      />
                    </View>
                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={errors.password ? colors.status.danger : colors.neutral.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Create a password"
                        placeholderTextColor={colors.neutral.textSecondary + '80'}
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          clearError('password');
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={errors.confirmPassword ? colors.status.danger : colors.neutral.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Re-enter password"
                        placeholderTextColor={colors.neutral.textSecondary + '80'}
                        value={confirmPassword}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          clearError('confirmPassword');
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.confirmPassword ? (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    ) : null}
                  </View>
                </View>
              </LiquidCard>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonSection}>
              <LargeCTAButton
                title={isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                onPress={handleSignUp}
                disabled={isLoading}
                loading={isLoading}
                variant="success"
              />
            </View>

            {/* Back to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
                Login here
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral.pureWhite,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.neutral.warmCream,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formContainer: {
    padding: 20,
    gap: 20,
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
  inputWrapperError: {
    borderColor: colors.status.danger,
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
  errorText: {
    fontSize: 13,
    color: colors.status.danger,
    marginTop: 4,
  },
  buttonSection: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral.warmCream,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.pureWhite,
    textDecorationLine: 'underline',
  },
});
