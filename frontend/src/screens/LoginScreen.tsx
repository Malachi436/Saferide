import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { LargeCTAButton, LiquidCard } from '../components';
import { UserRole } from '../types';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');

  const handleLogin = async () => {
    try {
      await login({ email, password, role });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to ROSAgo</Text>
        <Text style={styles.subtitle}>School Transport Management</Text>
      </View>

      <LiquidCard className="mt-8">
        <View style={styles.roleSelector}>
          <Text style={styles.label}>I am a:</Text>
          <View style={styles.roleButtons}>
            <View
              style={[
                styles.roleButton,
                role === 'parent' && styles.roleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'parent' && styles.roleButtonTextActive,
                ]}
                onPress={() => setRole('parent')}
              >
                Parent
              </Text>
            </View>
            <View
              style={[
                styles.roleButton,
                role === 'driver' && styles.roleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'driver' && styles.roleButtonTextActive,
                ]}
                onPress={() => setRole('driver')}
              >
                Driver
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <LargeCTAButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            className="mt-4"
          />
        </View>
      </LiquidCard>

      {role === 'parent' && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate('ParentSignUp' as never)}
          >
            Sign Up
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  roleSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
