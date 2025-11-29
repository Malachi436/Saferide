import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { LiquidCard, LargeCTAButton } from '../components';
import { PickupType } from '../types';
import { Ionicons } from '@expo/vector-icons';

export const AddChildScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { addChild } = useAttendanceStore();
  
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [pickupType, setPickupType] = useState<PickupType>('home');
  const [roadName, setRoadName] = useState('');

  const handleSubmit = () => {
    if (!name || !school) {
      alert('Please fill in all required fields');
      return;
    }

    const childData = {
      name,
      school,
      grade,
      pickupType,
      pickupLocation: pickupType === 'home' 
        ? {
            latitude: 37.7749,
            longitude: -122.4194,
            address: 'Current Location',
          }
        : {
            latitude: 0,
            longitude: 0,
            roadName,
          },
    };

    addChild(childData, user?.id || 'parent1');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Child</Text>

      <LiquidCard className="mt-4">
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Child's Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter child's name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>School *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter school name"
              value={school}
              onChangeText={setSchool}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Grade</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3rd Grade"
              value={grade}
              onChangeText={setGrade}
            />
          </View>
        </View>
      </LiquidCard>

      <LiquidCard className="mt-4">
        <Text style={styles.sectionTitle}>Pickup Type</Text>
        <View style={styles.pickupTypeButtons}>
          <View
            style={[
              styles.pickupTypeButton,
              pickupType === 'home' && styles.pickupTypeButtonActive,
            ]}
          >
            <Ionicons
              name="home-outline"
              size={24}
              color={pickupType === 'home' ? '#3B82F6' : '#6B7280'}
            />
            <Text
              style={[
                styles.pickupTypeText,
                pickupType === 'home' && styles.pickupTypeTextActive,
              ]}
              onPress={() => setPickupType('home')}
            >
              Home Pickup
            </Text>
          </View>

          <View
            style={[
              styles.pickupTypeButton,
              pickupType === 'roadside' && styles.pickupTypeButtonActive,
            ]}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={pickupType === 'roadside' ? '#3B82F6' : '#6B7280'}
            />
            <Text
              style={[
                styles.pickupTypeText,
                pickupType === 'roadside' && styles.pickupTypeTextActive,
              ]}
              onPress={() => setPickupType('roadside')}
            >
              Roadside Pickup
            </Text>
          </View>
        </View>

        {pickupType === 'home' && (
          <LargeCTAButton
            title="Use Current Location"
            onPress={() => alert('Location captured')}
            variant="secondary"
            className="mt-4"
          />
        )}

        {pickupType === 'roadside' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Road Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter road name"
              value={roadName}
              onChangeText={setRoadName}
            />
          </View>
        )}
      </LiquidCard>

      <LargeCTAButton
        title="Add Child"
        onPress={handleSubmit}
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
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
    marginTop: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  pickupTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pickupTypeButton: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pickupTypeButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  pickupTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  pickupTypeTextActive: {
    color: '#3B82F6',
  },
});
