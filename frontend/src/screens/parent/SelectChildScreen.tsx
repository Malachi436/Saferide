/**
 * Select Child Screen
 * Parents select existing children from school during onboarding
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { apiClient } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";

type Props = NativeStackScreenProps<ParentStackParamList, "AddChild">;

interface School {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface AvailableChild {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  school: School;
  driver?: { id: string; user: { firstName: string; lastName: string } };
}

interface ChildSelectionData {
  childId: string;
  schoolId: string;
  pickupType: "SCHOOL" | "HOME" | "ROADSIDE";
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupDescription?: string;
  homeLatitude?: number;
  homeLongitude?: number;
  homeAddress?: string;
  planId: string;
}

export default function SelectChildScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [availableChildren, setAvailableChildren] = useState<AvailableChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<AvailableChild | null>(null);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"school" | "child" | "pickup" | "plan">("school");

  // Pickup form data
  const [pickupType, setPickupType] = useState<"SCHOOL" | "HOME" | "ROADSIDE">("SCHOOL");
  const [homeAddress, setHomeAddress] = useState("");
  const [roadsideDescription, setRoadsideDescription] = useState("");

  // Payment plan
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Errors
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const response = await apiClient.get("/children/public/schools");
      setSchools(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      Alert.alert("Error", "Failed to load schools");
    } finally {
      setLoadingSchools(false);
    }
  };

  const fetchAvailableChildren = async (schoolId: string) => {
    try {
      setLoadingChildren(true);
      const response = await apiClient.get(
        `/children/school/${schoolId}/available`
      );
      setAvailableChildren(Array.isArray(response) ? response : []);
      if (Array.isArray(response) && response.length === 0) {
        Alert.alert("No Children", "No available children for this school");
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      Alert.alert("Error", "Failed to load available children");
    } finally {
      setLoadingChildren(false);
    }
  };

  const fetchPaymentPlans = async (companyId: string) => {
    try {
      setLoadingPlans(true);
      const response = await apiClient.get(
        `/payment-plans/company/${companyId}`
      );
      setPaymentPlans(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching payment plans:", error);
      Alert.alert("Error", "Failed to load payment plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSelectSchool = async (school: School) => {
    setSelectedSchool(school);
    setError("");
    await fetchAvailableChildren(school.id);
    setStep("child");
  };

  const handleSelectChild = (child: AvailableChild) => {
    setSelectedChild(child);
    setError("");
    // Fetch payment plans based on school's company
    if (child.school.companyId) {
      fetchPaymentPlans(child.school.companyId);
    }
    setStep("pickup");
  };

  const handleNextStep = () => {
    if (step === "pickup") {
      // Validate pickup info
      if (pickupType === "HOME" && !homeAddress.trim()) {
        setError("Please enter home address");
        return;
      }
      if (pickupType === "ROADSIDE" && !roadsideDescription.trim()) {
        setError("Please enter location description");
        return;
      }
      setError("");
      setStep("plan");
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild || !selectedPlan || !user) {
      setError("Please complete all steps");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Step 1: Assign child to parent with pickup details
      const pickupData = {
        parentId: user.id,
        pickupType,
        homeAddress: pickupType === "HOME" ? homeAddress : undefined,
        pickupDescription: pickupType === "ROADSIDE" ? roadsideDescription : undefined,
      };

      await apiClient.post(
        `/children/${selectedChild.id}/assign`,
        pickupData
      );

      // Step 2: Subscribe to payment plan
      await apiClient.post(
        `/children/${selectedChild.id}/subscribe-plan`,
        {
          parentId: user.id,
          planId: selectedPlan.id,
        }
      );

      Alert.alert("Success", "Child added successfully!");
      navigation.goBack();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to add child";
      setError(errorMsg);
      console.error("Error adding child:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (step === "school") {
      navigation.goBack();
    } else if (step === "child") {
      setStep("school");
      setSelectedSchool(null);
      setSelectedChild(null);
    } else if (step === "pickup") {
      setStep("child");
      setSelectedChild(null);
    } else if (step === "plan") {
      setStep("pickup");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown} style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={colors.primary.blue}
              />
            </Pressable>
            <Text style={styles.headerTitle}>
              {step === "school" && "Select School"}
              {step === "child" && "Select Child"}
              {step === "pickup" && "Pickup Location"}
              {step === "plan" && "Payment Plan"}
            </Text>
            <View style={styles.backPlaceholder} />
          </Animated.View>

          {/* Error Message */}
          {error && (
            <Animated.View entering={FadeInDown} style={styles.errorCard}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.status.dangerRed}
              />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Step 1: School Selection */}
          {step === "school" && (
            <Animated.View entering={FadeInDown} style={styles.stepContent}>
              <Text style={styles.stepTitle}>Which school does your child attend?</Text>
              {loadingSchools ? (
                <ActivityIndicator size="large" color={colors.primary.blue} />
              ) : (
                <View style={styles.schoolsList}>
                  {schools.map((school) => (
                    <Pressable
                      key={school.id}
                      onPress={() => handleSelectSchool(school)}
                      style={[
                        styles.schoolCard,
                        selectedSchool?.id === school.id && styles.selectedCard,
                      ]}
                    >
                      <Ionicons
                        name="school"
                        size={24}
                        color={colors.primary.blue}
                      />
                      <View style={styles.schoolInfo}>
                        <Text style={styles.schoolName}>{school.name}</Text>
                        {school.address && (
                          <Text style={styles.schoolAddress}>{school.address}</Text>
                        )}
                      </View>
                      {selectedSchool?.id === school.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.status.successGreen}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* Step 2: Child Selection */}
          {step === "child" && (
            <Animated.View entering={FadeInDown} style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Select your child at {selectedSchool?.name}
              </Text>
              {loadingChildren ? (
                <ActivityIndicator size="large" color={colors.primary.blue} />
              ) : (
                <View style={styles.childrenList}>
                  {availableChildren.map((child) => (
                    <Pressable
                      key={child.id}
                      onPress={() => handleSelectChild(child)}
                      style={[
                        styles.childCard,
                        selectedChild?.id === child.id && styles.selectedCard,
                      ]}
                    >
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>
                          {child.firstName} {child.lastName}
                        </Text>
                        {child.driver && (
                          <Text style={styles.driverInfo}>
                            Driver: {child.driver.user.firstName} {child.driver.user.lastName}
                          </Text>
                        )}
                      </View>
                      {selectedChild?.id === child.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.status.successGreen}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* Step 3: Pickup Location */}
          {step === "pickup" && (
            <Animated.View entering={FadeInDown} style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Pickup Location for {selectedChild?.firstName}
              </Text>

              {/* Pickup Type Selection */}
              <View style={styles.pickupTypeContainer}>
                {(["SCHOOL", "HOME", "ROADSIDE"] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setPickupType(type)}
                    style={[
                      styles.pickupTypeButton,
                      pickupType === type && styles.pickupTypeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickupTypeText,
                        pickupType === type && styles.pickupTypeTextActive,
                      ]}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Home Address Input */}
              {pickupType === "HOME" && (
                <LiquidGlassCard style={styles.inputCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter home address"
                    placeholderTextColor={colors.neutral.warmGray}
                    value={homeAddress}
                    onChangeText={setHomeAddress}
                    multiline
                  />
                </LiquidGlassCard>
              )}

              {/* Roadside Description Input */}
              {pickupType === "ROADSIDE" && (
                <LiquidGlassCard style={styles.inputCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="Describe the pickup location (e.g., near library, bus stop)"
                    placeholderTextColor={colors.neutral.warmGray}
                    value={roadsideDescription}
                    onChangeText={setRoadsideDescription}
                    multiline
                  />
                </LiquidGlassCard>
              )}

              {/* Next Button */}
              <LargeCTAButton
                text="Next"
                onPress={handleNextStep}
                disabled={isSubmitting}
              />
            </Animated.View>
          )}

          {/* Step 4: Payment Plan Selection */}
          {step === "plan" && (
            <Animated.View entering={FadeInDown} style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select Payment Plan</Text>
              {loadingPlans ? (
                <ActivityIndicator size="large" color={colors.primary.blue} />
              ) : (
                <View style={styles.plansList}>
                  {paymentPlans.map((plan) => (
                    <Pressable
                      key={plan.id}
                      onPress={() => setSelectedPlan(plan)}
                      style={[
                        styles.planCard,
                        selectedPlan?.id === plan.id && styles.selectedCard,
                      ]}
                    >
                      <View style={styles.planHeader}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planPrice}>
                          GHS {(plan.amount / 100).toFixed(2)}/
                          {plan.frequency}
                        </Text>
                      </View>
                      {plan.description && (
                        <Text style={styles.planDescription}>
                          {plan.description}
                        </Text>
                      )}
                      {plan.features && plan.features.length > 0 && (
                        <View style={styles.featuresList}>
                          {plan.features.map((feature: string, idx: number) => (
                            <View key={idx} style={styles.featureItem}>
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.status.successGreen}
                              />
                              <Text style={styles.featureText}>{feature}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {selectedPlan?.id === plan.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.status.successGreen}
                          style={styles.planCheckmark}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Submit Button */}
              <LargeCTAButton
                text="Complete Setup"
                onPress={handleSubmit}
                disabled={isSubmitting || !selectedPlan}
                loading={isSubmitting}
              />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
    flex: 1,
    textAlign: "center",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.dangerRed + "20",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.dangerRed,
  },
  errorText: {
    color: colors.status.dangerRed,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
    marginBottom: 16,
  },
  schoolsList: {
    gap: 12,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.darkGray + "40",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: colors.primary.blue,
    backgroundColor: colors.primary.blue + "15",
  },
  schoolInfo: {
    marginLeft: 12,
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
  },
  schoolAddress: {
    fontSize: 12,
    color: colors.neutral.warmGray,
    marginTop: 4,
  },
  childrenList: {
    gap: 12,
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.darkGray + "40",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
  },
  driverInfo: {
    fontSize: 12,
    color: colors.neutral.warmGray,
    marginTop: 4,
  },
  pickupTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pickupTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.neutral.darkGray + "40",
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  pickupTypeButtonActive: {
    borderColor: colors.primary.blue,
    backgroundColor: colors.primary.blue + "15",
  },
  pickupTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.warmGray,
  },
  pickupTypeTextActive: {
    color: colors.primary.blue,
  },
  inputCard: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: colors.neutral.pureWhite,
    minHeight: 60,
    paddingVertical: 12,
  },
  plansList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: colors.neutral.darkGray + "40",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
    flex: 1,
  },
  planPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  planDescription: {
    fontSize: 12,
    color: colors.neutral.warmGray,
    marginBottom: 8,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: colors.neutral.warmGray,
  },
  planCheckmark: {
    position: "absolute",
    top: 12,
    right: 12,
  },
});
