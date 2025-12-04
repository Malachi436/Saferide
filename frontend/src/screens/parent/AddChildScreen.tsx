/**
 * Add Child Screen
 * Add a new child to parent account
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
  Modal,
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

type PickupType = "home" | "roadside";

interface School {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  companyId?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalNotes: string;
  pickupType: PickupType;
  pickupAddress: string;
  roadsideName: string;
}

export default function AddChildScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    grade: "",
    schoolId: "",
    schoolName: "",
    allergies: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalNotes: "",
    pickupType: "home",
    pickupAddress: "",
    roadsideName: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);

  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const response = await apiClient.get('/children/public/schools');
      setSchools(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchools([]);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Special handling for date of birth to auto-insert slashes
    if (field === "dateOfBirth") {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, "");
      
      // Format as DD/MM/YYYY
      let formatted = "";
      if (digitsOnly.length > 0) {
        formatted = digitsOnly.substring(0, 2);
        if (digitsOnly.length >= 3) {
          formatted += "/" + digitsOnly.substring(2, 4);
        }
        if (digitsOnly.length >= 5) {
          formatted += "/" + digitsOnly.substring(4, 8);
        }
      }
      
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Date must be in DD/MM/YYYY format";
    } else {
      // Validate the date is valid
      const [day, month, year] = formData.dateOfBirth.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        newErrors.dateOfBirth = "Invalid date";
      } else if (date > new Date()) {
        newErrors.dateOfBirth = "Date cannot be in the future";
      }
    }
    if (!formData.grade.trim()) {
      newErrors.grade = "Grade is required";
    }
    if (!formData.schoolId.trim()) {
      newErrors.schoolId = "School selection is required";
    }
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact is required";
    }
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "Emergency phone is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.emergencyPhone.replace(/\s/g, ""))) {
      newErrors.emergencyPhone = "Invalid phone number";
    }

    // Validate based on pickup type
    // For home pickup, location is automatically used (address is optional)
    // For roadside pickup, road name is required
    if (formData.pickupType === "roadside") {
      if (!formData.roadsideName.trim()) {
        newErrors.roadsideName = "Road name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse DD/MM/YYYY to ISO date
      const [day, month, year] = formData.dateOfBirth.split("/").map(Number);
      const dateOfBirth = new Date(year, month - 1, day);
      
      // Create child with parent ID
      const childData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: dateOfBirth.toISOString(),
        parentId: user.id,
        schoolId: formData.schoolId,
        pickupType: formData.pickupType.toUpperCase(),
        pickupLatitude: formData.pickupType === "home" ? null : undefined,
        pickupLongitude: formData.pickupType === "home" ? null : undefined,
        pickupDescription: formData.pickupType === "roadside" ? formData.roadsideName : null,
        homeLatitude: null,
        homeLongitude: null,
        homeAddress: formData.pickupAddress || null,
      };

      console.log('[AddChild] Submitting child data:', childData);
      const response = await apiClient.post('/children', childData);
      console.log('[AddChild] Child created:', response);

      Alert.alert(
        "Success",
        `${formData.firstName} ${formData.lastName} has been added successfully!`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[AddChild] Error creating child:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add child. Please try again.';
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    options?: {
      multiline?: boolean;
      keyboardType?: "default" | "phone-pad" | "number-pad";
      icon?: keyof typeof Ionicons.glyphMap;
    }
  ) => {
    const hasError = !!errors[field];

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          <Text style={styles.required}> *</Text>
        </Text>
        <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
          {options?.icon && (
            <Ionicons
              name={options.icon}
              size={20}
              color={hasError ? colors.status.dangerRed : colors.neutral.textSecondary}
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
            keyboardType={options?.keyboardType || "default"}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 3 : 1}
          />
        </View>
        {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  const renderOptionalInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    options?: {
      multiline?: boolean;
      icon?: keyof typeof Ionicons.glyphMap;
    }
  ) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          <Text style={styles.optional}> (Optional)</Text>
        </Text>
        <View style={styles.inputWrapper}>
          {options?.icon && (
            <Ionicons
              name={options.icon}
              size={20}
              color={colors.neutral.textSecondary}
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
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 3 : 1}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.header}>
              <Ionicons name="person-add" size={32} color={colors.primary.blue} />
              <Text style={styles.headerTitle}>Add New Child</Text>
              <Text style={styles.headerSubtitle}>
                Fill in the details below to add your child to the system
              </Text>
            </View>
          </Animated.View>

          {/* Basic Information */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.formSection}>
                {renderInput("firstName", "First Name", "Enter first name", {
                  icon: "person",
                })}
                {renderInput("lastName", "Last Name", "Enter last name", {
                  icon: "person",
                })}
                {renderInput("dateOfBirth", "Date of Birth", "DD/MM/YYYY", {
                  icon: "calendar",
                  keyboardType: "number-pad",
                })}
                {renderInput("grade", "Grade/Class", "e.g., Grade 5", {
                  icon: "school",
                })}

                {/* School Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    School
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <Pressable
                    onPress={() => setShowSchoolPicker(true)}
                    style={[
                      styles.inputWrapper,
                      errors.schoolId && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="business"
                      size={20}
                      color={
                        errors.schoolId
                          ? colors.status.dangerRed
                          : colors.neutral.textSecondary
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.pickerText,
                        !formData.schoolName && styles.pickerPlaceholder,
                      ]}
                    >
                      {formData.schoolName || "Select a school"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={colors.neutral.textSecondary}
                      style={styles.chevronIcon}
                    />
                  </Pressable>
                  {errors.schoolId && (
                    <Text style={styles.errorText}>{errors.schoolId}</Text>
                  )}
                </View>
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Medical Information */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.formSection}>
                {renderOptionalInput("allergies", "Allergies", "List any allergies", {
                  icon: "warning",
                })}
                {renderOptionalInput(
                  "medicalNotes",
                  "Medical Notes",
                  "Any medical conditions or notes",
                  {
                    multiline: true,
                    icon: "medical",
                  }
                )}
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Emergency Contact */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.formSection}>
                {renderInput(
                  "emergencyContact",
                  "Contact Name",
                  "Full name of emergency contact",
                  {
                    icon: "call",
                  }
                )}
                {renderInput(
                  "emergencyPhone",
                  "Contact Phone",
                  "+233 XX XXX XXXX",
                  {
                    keyboardType: "phone-pad",
                    icon: "call",
                  }
                )}
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Route Information */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.sectionTitle}>Pickup & Dropoff</Text>
            <LiquidGlassCard intensity="medium" className="mb-4">
              <View style={styles.formSection}>
                {/* Pickup Type Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Pickup Type
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.pickupTypeContainer}>
                    {/* Home Pickup */}
                    <Pressable
                      onPress={() => handleInputChange("pickupType", "home")}
                      style={[
                        styles.pickupTypeCard,
                        formData.pickupType === "home" && styles.pickupTypeCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.pickupTypeIcon,
                          formData.pickupType === "home" && styles.pickupTypeIconActive,
                        ]}
                      >
                        <Ionicons
                          name="home"
                          size={24}
                          color={
                            formData.pickupType === "home"
                              ? colors.primary.blue
                              : colors.neutral.textSecondary
                          }
                        />
                      </View>
                      <View style={styles.pickupTypeContent}>
                        <Text
                          style={[
                            styles.pickupTypeTitle,
                            formData.pickupType === "home" && styles.pickupTypeTitleActive,
                          ]}
                        >
                          Home Pickup
                        </Text>
                        <Text style={styles.pickupTypeDescription}>
                          Bus comes to your home location
                        </Text>
                      </View>
                      {formData.pickupType === "home" && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary.blue} />
                      )}
                    </Pressable>

                    {/* Road Side Pickup */}
                    <Pressable
                      onPress={() => handleInputChange("pickupType", "roadside")}
                      style={[
                        styles.pickupTypeCard,
                        formData.pickupType === "roadside" && styles.pickupTypeCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.pickupTypeIcon,
                          formData.pickupType === "roadside" && styles.pickupTypeIconActive,
                        ]}
                      >
                        <Ionicons
                          name="location"
                          size={24}
                          color={
                            formData.pickupType === "roadside"
                              ? colors.primary.blue
                              : colors.neutral.textSecondary
                          }
                        />
                      </View>
                      <View style={styles.pickupTypeContent}>
                        <Text
                          style={[
                            styles.pickupTypeTitle,
                            formData.pickupType === "roadside" && styles.pickupTypeTitleActive,
                          ]}
                        >
                          Road Side Pickup
                        </Text>
                        <Text style={styles.pickupTypeDescription}>
                          Child waits along a named road
                        </Text>
                      </View>
                      {formData.pickupType === "roadside" && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary.blue} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Conditional Fields Based on Pickup Type */}
                {formData.pickupType === "home" ? (
                  <>
                    <View style={styles.infoBox}>
                      <Ionicons name="location" size={20} color={colors.primary.blue} />
                      <Text style={styles.infoText}>
                        Your home location will be automatically detected. The bus will come directly
                        to pick up your child at your location.
                      </Text>
                    </View>
                    {renderOptionalInput(
                      "pickupAddress",
                      "Home Address",
                      "Add address details (optional for reference)",
                      {
                        multiline: true,
                        icon: "home",
                      }
                    )}
                  </>
                ) : (
                  <>
                    {renderInput(
                      "roadsideName",
                      "Road Name",
                      "Enter the name of the road (e.g., Oxford Street)",
                      {
                        icon: "navigate",
                      }
                    )}
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle" size={20} color={colors.status.infoBlue} />
                      <Text style={styles.infoText}>
                        Your child&apos;s location will be used to determine the expected pickup spot
                        along this road. The driver will look out for your child at that location.
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <LargeCTAButton
              title={isSubmitting ? "Adding Child..." : "Add Child"}
              onPress={handleSubmit}
              disabled={isSubmitting}
              variant="success"
              style={styles.submitButton}
            />
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* School Picker Modal */}
      <Modal
        visible={showSchoolPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSchoolPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSchoolPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select School</Text>
              <Pressable
                onPress={() => setShowSchoolPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.neutral.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.schoolList}
              showsVerticalScrollIndicator={false}
            >
              {loadingSchools ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading schools...</Text>
                </View>
              ) : schools.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No schools available</Text>
                </View>
              ) : (
                schools.map((school) => (
                  <Pressable
                    key={school.id}
                    style={[
                      styles.schoolItem,
                      formData.schoolId === school.id && styles.schoolItemSelected,
                    ]}
                    onPress={() => {
                      handleInputChange("schoolId", school.id);
                      handleInputChange("schoolName", school.name);
                      setShowSchoolPicker(false);
                    }}
                  >
                    <View style={styles.schoolItemContent}>
                      <View
                        style={[
                          styles.schoolItemIcon,
                          formData.schoolId === school.id &&
                            styles.schoolItemIconSelected,
                        ]}
                      >
                        <Ionicons
                          name="school"
                          size={20}
                          color={
                            formData.schoolId === school.id
                              ? colors.primary.blue
                              : colors.neutral.textSecondary
                          }
                        />
                      </View>
                      <View style={styles.schoolItemInfo}>
                        <Text
                          style={[
                            styles.schoolItemName,
                            formData.schoolId === school.id &&
                              styles.schoolItemNameSelected,
                          ]}
                        >
                          {school.name}
                        </Text>
                        <Text style={styles.schoolItemAddress}>
                          {school.address || "No address provided"}
                        </Text>
                      </View>
                    </View>
                    {formData.schoolId === school.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary.blue}
                      />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  formSection: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  required: {
    color: colors.status.dangerRed,
  },
  optional: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    fontWeight: "400",
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
    borderColor: colors.status.dangerRed,
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
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 13,
    color: colors.status.dangerRed,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  pickupTypeContainer: {
    gap: 12,
  },
  pickupTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral.textSecondary + "30",
    gap: 12,
  },
  pickupTypeCardActive: {
    borderColor: colors.primary.blue,
    backgroundColor: colors.primary.blue + "10",
  },
  pickupTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.textSecondary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  pickupTypeIconActive: {
    backgroundColor: colors.primary.blue + "20",
  },
  pickupTypeContent: {
    flex: 1,
  },
  pickupTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  pickupTypeTitleActive: {
    color: colors.primary.blue,
  },
  pickupTypeDescription: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: colors.status.infoBlue + "10",
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral.textSecondary,
    lineHeight: 18,
  },
  pickerText: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.neutral.textPrimary,
  },
  pickerPlaceholder: {
    color: colors.neutral.textSecondary + "80",
  },
  chevronIcon: {
    marginRight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.neutral.pureWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    minHeight: 200,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.textSecondary + "20",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.creamWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  schoolList: {
    flex: 1,
  },
  schoolItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.textSecondary + "10",
  },
  schoolItemSelected: {
    backgroundColor: colors.primary.blue + "10",
  },
  schoolItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  schoolItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral.creamWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  schoolItemIconSelected: {
    backgroundColor: colors.primary.blue + "20",
  },
  schoolItemInfo: {
    flex: 1,
  },
  schoolItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  schoolItemNameSelected: {
    color: colors.primary.blue,
  },
  schoolItemAddress: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
  },
});
