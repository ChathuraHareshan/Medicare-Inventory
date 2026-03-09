import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { medicineAPI, Medicine } from './services/medicineAPI';
import { useTheme } from './context/ThemeContext';

const HomeScreen = () => {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const [recentMedicines, setRecentMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expired: 0,
    outOfStock: 0, 
  });

  const loadMedicines = async () => {
    try {
      const data = await medicineAPI.getAllMedicines();
      
      const recent = data.slice(0, 3);
      setRecentMedicines(recent);
      
      const lowStock = data.filter(m => m.status === "Low Stock" || m.status === "Critical").length;
      const outOfStock = data.filter(m => m.status === "Out of Stock").length; 
      
      const today = new Date();
      const expired = data.filter(m => {
        const expiryDate = new Date(m.expiryDate);
        return expiryDate < today;
      }).length;
      
      setStats({
        total: data.length,
        lowStock: lowStock,
        expired: expired,
        outOfStock: outOfStock, 
      });
      
    } catch (error) {
      console.error("Error loading medicines:", error);
    }
  };

  useEffect(() => {
    loadMedicines().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedicines();
    setRefreshing(false);
  }, []);

  

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "In Stock": return theme.success;
      case "Low Stock": return theme.warning;
      case "Critical": return theme.danger;
      case "Out of Stock": return theme.textSecondary;
      default: return theme.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { backgroundColor: theme.background, paddingBottom: 80 }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
          title="Pull to refresh"
          titleColor={theme.text}
        />
      }
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appName}>MediCare Inventory</Text>
            <Text style={[styles.tagline, { color: isDarkMode ? '#aaa' : '#d0e2f2' }]}>
              Pharmacy Stock Controller
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card }]}
          onPress={() => router.push('/productList')}
        >
          <Text style={[styles.statNumber, { color: theme.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card }]}
          onPress={() => router.push('/productList?filter=lowstock')}
        >
          <Text style={[styles.statNumber, { color: theme.text }]}>{stats.lowStock}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Low Stock</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card }]}
          onPress={() => router.push('/productList?filter=expired')}
        >
          <Text style={[styles.statNumber, { color: theme.text }]}>{stats.expired}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Expired</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card }]}
          onPress={() => router.push('/productList?filter=outofstock')}
        >
          <Text style={[styles.statNumber, { color: theme.danger }]}>{stats.outOfStock}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Out Stock</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={[styles.themeRow, { backgroundColor: theme.card }]}>
          <Text style={[styles.themeText, { color: theme.text }]}>
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/addProduct')}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={[styles.actionText, { color: theme.text }]}>Add Medicine</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/productList')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionText, { color: theme.text }]}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Products</Text>
          <View style={styles.sectionHeaderRight}>
            {refreshing && <ActivityIndicator size="small" color={theme.primary} />}
            <TouchableOpacity onPress={() => router.push('/productList')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {recentMedicines.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No medicines added yet
            </Text>
          </View>
        ) : (
          recentMedicines.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.recentCard, { backgroundColor: theme.card }]}
              onPress={() => router.push({
                pathname: '/addProduct',
                params: {
                  id: String(item.id),
                  name: item.name,
                  expiryDate: item.expiryDate,
                  stock: String(item.stock),
                  price: String(item.price),
                  isEdit: "true",
                  timestamp: Date.now().toString(),
                }
              })}
            >
              <View style={styles.recentHeader}>
                <Text style={[styles.recentName, { color: theme.text }]}>{item.name}</Text>
                <View style={[styles.recentBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.recentStatus, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.recentDetails}>
                <View style={styles.recentDetailItem}>
                  <Text style={[styles.recentDetailLabel, { color: theme.textSecondary }]}>Expiry</Text>
                  <Text style={[styles.recentDetailValue, { color: theme.text }]}>{formatDate(item.expiryDate)}</Text>
                </View>
                
                <View style={styles.recentDetailItem}>
                  <Text style={[styles.recentDetailLabel, { color: theme.textSecondary }]}>Stock</Text>
                  <Text style={[styles.recentDetailValue, { color: theme.text }]}>{item.stock} units</Text>
                </View>
                
                <View style={styles.recentDetailItem}>
                  <Text style={[styles.recentDetailLabel, { color: theme.textSecondary }]}>Price</Text>
                  <Text style={[styles.recentDetailValue, { color: theme.text }]}>Rs.{item.price.toFixed(2)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: 14,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -20,
    marginHorizontal: 10, 
  },
  statCard: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3, 
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18, 
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10, 
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  recentCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  recentStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  recentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentDetailItem: {
    flex: 1,
  },
  recentDetailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  recentDetailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default HomeScreen;