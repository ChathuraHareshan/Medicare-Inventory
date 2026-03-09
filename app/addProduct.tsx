import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { AddMedicineRequest, medicineAPI } from "./services/medicineAPI";
import { useTheme } from "./context/ThemeContext";

type AddProductForm = {
  medicineName: string;
  expiryDate: string;
  stock: string;
  price: string;
};

type FormErrors = {
  medicineName?: string;
  expiryDate?: string;
  stock?: string;
  price?: string;
};

const INITIAL_FORM: AddProductForm = {
  medicineName: "",
  expiryDate: "",
  stock: "",
  price: "",
};

const AddProduct = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, isDarkMode } = useTheme();

  const isEdit = params.isEdit === "true";
  const medicineId = params.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AddProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const formatDateForEdit = (dateString: string): string => {
    if (!dateString) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    console.log("AddProduct - Params:", {
      id: params.id,
      medicineId: medicineId,
      isEdit: isEdit
    });
    
    if (isEdit) {
      const expiryDate = formatDateForEdit(params.expiryDate as string);
      
      console.log("Edit mode - loading data for ID:", medicineId);

      setForm({
        medicineName: (params.name as string) || "",
        expiryDate: expiryDate,
        stock: (params.stock as string) || "",
        price: (params.price as string) || "",
      });
    } else {
      resetForm();
    }
  }, [isEdit, JSON.stringify(params)]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleChange = (field: keyof AddProductForm, value: string) => {
    if (field === "stock" || field === "price") {
      const numericRegex = /^[0-9]*\.?[0-9]*$/;
      if (value === "" || numericRegex.test(value)) {
        setForm({ ...form, [field]: value });
      }
    } else {
      setForm({ ...form, [field]: value });
    }

    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.medicineName.trim()) {
      newErrors.medicineName = "Medicine name is required";
    }
    if (!form.price.trim()) {
      newErrors.price = "Unit price is required";
    }

    if (!form.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expiryDate)) {
      newErrors.expiryDate = "Use YYYY-MM-DD format";
    }
    if (!form.stock.trim()) {
      newErrors.stock = "Stock quantity is required";
    } else if (isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      newErrors.stock = "Enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setLoading(true);

      try {
        const medicineData: AddMedicineRequest = {
          name: form.medicineName,
          expiryDate: form.expiryDate,
          stock: parseInt(form.stock),
          price: parseFloat(form.price),
        };

        console.log("Submitting medicine data:", medicineData);

        let response;

        if (isEdit && medicineId) {
          response = await medicineAPI.updateMedicine(medicineId, medicineData);
          console.log("Update response:", response);
        } else {
          response = await medicineAPI.addMedicine(medicineData);
          console.log("Add response:", response);
        }

        const isSuccess =
          response.status === "success" ||
          response.status === true ||
          response.status === "true";

        if (isSuccess) {
          Alert.alert(
            "Success",
            response.message ||
              `Medicine ${isEdit ? "updated" : "added"} successfully!`,
            [
              {
                text: "OK",
                onPress: () => {
                  resetForm();
                  router.push("/productList");
                },
              },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert("Error", response.message || "Failed to save medicine");
        }
      } catch (error) {
        console.error("Error saving medicine:", error);
        Alert.alert("Error", "Failed to save medicine. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push("/productList");
  };

  return (
    <ScrollView
      style={[styles.contentContainer, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Medicine" : "Add New Medicine"}
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#aaa' : '#d0e2f2' }]}>
          {isEdit
            ? "Update product details below"
            : "Enter product details below"}
        </Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Medicine Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
              errors.medicineName && styles.inputError
            ]}
            placeholder="e.g., Paracetamol 500mg"
            placeholderTextColor={theme.textSecondary}
            value={form.medicineName}
            onChangeText={(value: string) =>
              handleChange("medicineName", value)
            }
            editable={!loading}
          />
          {errors.medicineName && (
            <Text style={styles.errorText}>{errors.medicineName}</Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Expiry Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text,
                },
                errors.expiryDate && styles.inputError
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={form.expiryDate}
              onChangeText={(value) => {
                let formatted = value.replace(/[^0-9]/g, "");
                if (formatted.length >= 4) {
                  formatted = formatted.slice(0, 4) + "-" + formatted.slice(4);
                }
                if (formatted.length >= 7) {
                  formatted = formatted.slice(0, 7) + "-" + formatted.slice(7);
                }
                if (formatted.length > 10) {
                  formatted = formatted.slice(0, 10);
                }
                handleChange("expiryDate", formatted);
              }}
              maxLength={10}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.expiryDate && (
              <Text style={styles.errorText}>{errors.expiryDate}</Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Stock Quantity <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text,
                },
                errors.stock && styles.inputError
              ]}
              placeholder="e.g., 100"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={form.stock}
              onChangeText={(value: string) => handleChange("stock", value)}
              editable={!loading}
            />
            {errors.stock && (
              <Text style={styles.errorText}>{errors.stock}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Unit Price (Rs.) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
              errors.price && styles.inputError
            ]}
            placeholder="e.g., 250"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={form.price}
            onChangeText={(value: string) => handleChange("price", value)}
            editable={!loading}
          />
          {errors.price && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.price}</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.cancelButton, 
              { 
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              loading && styles.disabledButton
            ]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton, 
              { backgroundColor: theme.primary },
              loading && styles.disabledButton
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEdit ? "Update" : "Save"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 80,
  },
  disabledButton: {
    opacity: 0.5,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  formContainer: {
    marginHorizontal: 20,
    marginTop: -20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#d32f2f",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputError: {
    borderColor: "#d32f2f",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default AddProduct;