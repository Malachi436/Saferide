/**
 * Link Child Screen
 * Parents can link their account to children using unique codes
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { apiClient } from "../../utils/api";

export default function LinkChildScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState<1 | 2>(1);
  const [uniqueCode, setUniqueCode] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [homeLatitude, setHomeLatitude] = useState<number | null>(null);
  const [homeLongitude, setHomeLongitude] = useState<number | null>(null);
  const [linkedChild, setLinkedChild] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to set home address');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setHomeLatitude(location.coords.latitude);
      setHomeLongitude(location.coords.longitude);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses[0]) {
        const addr = addresses[0];
        const formattedAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        setHomeAddress(formattedAddress);
      }

      Alert.alert('Success', 'Location captured successfully!');
    } catch (err) {
      console.error('Error getting location:', err);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setGettingLocation(false);
    }
  };

  const verifyCode = async () => {
    if (!uniqueCode.trim()) {
      Alert.alert('Error', 'Please enter the unique code');
      return;
    }

    try {
      setLoading(true);
      // For verification, we'll proceed to step 2
      // The actual linking happens when they submit location
      setStep(2);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const linkChild = async () => {
    if (!homeLatitude || !homeLongitude) {
      Alert.alert('Error', 'Please set your home location using GPS');
      return;
    }

    if (!homeAddress.trim()) {
      Alert.alert('Error', 'Please enter your home address');
      return;
    }

    try {
      setLoading(true);
      
      const response: any = await apiClient.post('/children/link', {
        uniqueCode: uniqueCode.trim().toUpperCase(),
        homeLatitude,
        homeLongitude,
        homeAddress: homeAddress.trim(),
      });

      setLinkedChild(response);
      
      Alert.alert(
        'Success!',
        `Successfully linked ${response.firstName} ${response.lastName} to your account!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to link child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Link Child</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
        </View>

        {step === 1 ? (
          // Step 1: Enter Code
          <View>
            <LiquidGlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Enter Unique Code</Text>
              <Text style={styles.cardDescription}>
                Enter the unique code provided by your child's school to link your account.
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="ROS1234"
                  value={uniqueCode}
                  onChangeText={setUniqueCode}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.primary.yellow} />
                <Text style={styles.infoText}>
                  Contact your school admin if you don't have a code.
                </Text>
              </View>
            </LiquidGlassCard>

            <LargeCTAButton
              title={loading ? 'Verifying...' : 'Continue'}
              onPress={verifyCode}
              disabled={loading}
              variant="primary"
              style={styles.button}
            />
          </View>
        ) : (
          // Step 2: Set Home Location
          <View>
            <LiquidGlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Set Home Location</Text>
              <Text style={styles.cardDescription}>
                Set your home address so we know where to pick up your child.
              </Text>

              <Pressable
                style={styles.gpsButton}
                onPress={getCurrentLocation}
                disabled={gettingLocation}
              >
                <Ionicons name="location" size={24} color="#fff" />
                <Text style={styles.gpsButtonText}>
                  {gettingLocation ? 'Getting Location...' : 'Use Current Location (GPS)'}
                </Text>
              </Pressable>

              {(homeLatitude && homeLongitude) && (
                <View style={styles.locationPreview}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent.successGreen} />
                  <Text style={styles.locationText}>
                    📍 {homeLatitude.toFixed(6)}, {homeLongitude.toFixed(6)}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Home Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your home address"
                  value={homeAddress}
                  onChangeText={setHomeAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </LiquidGlassCard>

            <View style={styles.buttonRow}>
              <Pressable style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>Back</Text>
              </Pressable>
              
              <LargeCTAButton
                title={loading ? 'Linking...' : 'Link Child'}
                onPress={linkChild}
                disabled={loading || !homeLatitude || !homeLongitude}
                variant="primary"
                style={styles.submitButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  stepDotActive: {
    backgroundColor: colors.primary.blue,
    borderColor: colors.primary.blue,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textSecondary,
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.primary.blue,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 20,
  },
  codeInputContainer: {
    marginBottom: 16,
  },
  codeInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary.blue,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral.textPrimary,
    lineHeight: 18,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.blue,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    color: colors.neutral.textPrimary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.textPrimary,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  submitButton: {
    flex: 2,
  },
});
