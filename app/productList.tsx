import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Medicine, medicineAPI } from "./services/medicineAPI";
import { useTheme } from "./context/ThemeContext";

const ProductList = () => {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filters: string[] = [
    "All",
    "In Stock",
    "Low Stock",
    "Critical",
    "Out of Stock",
    "Expired", 
  ];

  const loadMedicines = async () => {
    try {
      setError(null);
      const data = await medicineAPI.getAllMedicines();
      setMedicines(data);
    } catch (err) {
      setError("Failed to load medicines. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines();
  };

  const handleEdit = (item: Medicine) => {
    console.log("Editing item ID:", item.id);

    router.push({
      pathname: "/addProduct",
      params: {
        id: String(item.id),
        name: item.name,
        expiryDate: item.expiryDate,
        stock: String(item.stock),
        price: String(item.price),
        isEdit: "true",
        timestamp: Date.now().toString(),
      },
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Medicine",
      "Are you sure you want to delete this medicine?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(id);
              const response = await medicineAPI.deleteMedicine(id);

              if (response.status === "success") {
                setMedicines((prev) => prev.filter((item) => item.id !== id));
                Alert.alert(
                  "Success",
                  response.message || "Medicine deleted successfully",
                );
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete medicine",
                );
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                "Failed to delete medicine. Please try again.",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "In Stock":
        return theme.success;
      case "Low Stock":
        return theme.warning;
      case "Critical":
        return theme.danger;
      case "Out of Stock":
        return theme.textSecondary;
      default:
        return theme.primary;
    }
  };

  const isExpired = (expiryDate: string): boolean => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const filteredMedicines = medicines.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (selectedFilter === "Expired") {
      return matchesSearch && isExpired(item.expiryDate);
    }

    const matchesFilter =
      selectedFilter === "All" || item.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const renderMedicineItem = ({ item }: { item: Medicine }) => {
    const expired = isExpired(item.expiryDate);

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.medicineName, { color: theme.text }]}>
              {item.name}
            </Text>
            <View style={styles.badgeContainer}>
              {expired && (
                <View
                  style={[
                    styles.expiredBadge,
                    { backgroundColor: theme.danger + "20" },
                  ]}
                >
                  <Text style={[styles.expiredText, { color: theme.danger }]}>
                    Expired
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Expiry Date
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: expired ? theme.danger : theme.text },
                ]}
              >
                {item.expiryDate}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Stock
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {item.stock} units
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Price
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                Rs.{item.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.warning }]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.danger }]}
            onPress={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading medicines...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={loadMedicines}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expiredCount = medicines.filter((m) => isExpired(m.expiryDate)).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Medicine Inventory</Text>
        <View style={styles.headerStats}>
          <Text
            style={[
              styles.headerSubtitle,
              { color: isDarkMode ? "#aaa" : "#d0e2f2" },
            ]}
          >
            {medicines.length} products
          </Text>
          {expiredCount > 0 && (
            <View
              style={[
                styles.expiredCountBadge,
                { backgroundColor: theme.danger },
              ]}
            >
              <Text style={styles.expiredCountText}>
                {expiredCount} expired
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.searchIcon, { color: theme.textSecondary }]}>
          🔍
        </Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by medicine name"
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={[styles.clearIcon, { color: theme.textSecondary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card },
                selectedFilter === filter && { backgroundColor: theme.primary },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.text },
                  selectedFilter === filter && { color: "#fff" },
                ]}
              >
                {filter}
                {filter === "Expired" && expiredCount > 0 && (
                  <Text style={styles.filterCount}> ({expiredCount})</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderTitle, { color: theme.text }]}>
          Product List
        </Text>
        <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
          {filteredMedicines.length} items
        </Text>
      </View>

      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View
            style={[styles.emptyContainer, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No medicines found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  expiredCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: -20,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 16,
    padding: 5,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  filterContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
  },
  filterCount: {
    fontSize: 11,
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  resultCount: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  expiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expiredText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ProductList;
