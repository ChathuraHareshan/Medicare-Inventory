import { Tabs } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

const TabIcon = ({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: string;
  label: string;
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.tabItem}>
      <Text 
        style={[
          styles.tabIcon, 
          { color: focused ? theme.tabIconFocused : theme.tabIcon }
        ]}
      >
        {icon}
      </Text>
      <Text 
        style={[
          styles.tabLabel, 
          { color: focused ? theme.tabIconFocused : theme.tabIcon }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

function TabLayout() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.statusBar} 
        backgroundColor={theme.statusBarBg} 
      />
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [styles.tabBar, { backgroundColor: theme.tabBar }],
          tabBarShowLabel: false,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="🏠" label="Home" />
            ),
          }}
        />

        <Tabs.Screen
          name="productList"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="📦" label="List" />
            ),
          }}
        />

        <Tabs.Screen
          name="addProduct"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="➕" label="Add" />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20, 
    right: 20, 
    borderRadius: 30,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingBottom: 5,
    justifyContent: "center",
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 5,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    paddingVertical: 2,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 14,
  },
});