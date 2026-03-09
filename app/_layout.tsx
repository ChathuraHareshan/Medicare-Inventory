import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2a6f97" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        {/* Splash Screen */}
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        
        {/* Home Screen */}
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="🏠" label="Home" />
            ),
          }}
        />
        
        {/* Product List Screen */}
        <Tabs.Screen
          name="productList"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="📦" label="List" />
            ),
          }}
        />
        
        {/* Add Product Screen */}
        <Tabs.Screen
          name="addProduct"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="➕" label="Add" />
            ),
          }}
        />
        
        {/* Profile Screen */}
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="👤" label="Profile" />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,    // දෙපැත්තෙන් සමාන ඉඩ
    right: 20,   // දෙපැත්තෙන් සමාන ඉඩ
    backgroundColor: '#fff',
    borderRadius: 30,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 7,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    paddingVertical: 2,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 0,
    color: '#8a9aa8',
  },
  tabIconFocused: {
    color: '#2a6f97',
  },
  tabLabel: {
    fontSize: 11,
    color: '#8a9aa8',
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 14,
  },
  tabLabelFocused: {
    color: '#2a6f97',
    fontWeight: '600',
  },
});