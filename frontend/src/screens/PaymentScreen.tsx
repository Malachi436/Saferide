import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { LiquidCard, LargeCTAButton } from '../components';
import { Ionicons } from '@expo/vector-icons';

export const PaymentScreen = () => {
  const [amount, setAmount] = useState('50');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePayment = () => {
    alert(`Payment of $${amount} initiated via MoMo Hubtle`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Make Payment</Text>

      <LiquidCard className="mt-4">
        <View style={styles.balanceSection}>
          <Ionicons name="cash-outline" size={32} color="#10B981" />
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>$150.00</Text>
          <Text style={styles.balanceSubtext}>Payment due: $50.00</Text>
        </View>
      </LiquidCard>

      <LiquidCard className="mt-4">
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile Money Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 234 567 8900"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.paymentMethod}>
          <Ionicons name="card-outline" size={20} color="#3B82F6" />
          <Text style={styles.paymentMethodText}>MoMo Hubtle</Text>
        </View>
      </LiquidCard>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          You will receive a prompt on your mobile phone to confirm the payment
        </Text>
      </View>

      <LargeCTAButton
        title={`Pay $${amount}`}
        onPress={handlePayment}
        className="mt-6"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
