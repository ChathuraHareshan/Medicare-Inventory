import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export const lightTheme = {
  background: "#f5f7fa",
  card: "#ffffff",
  tabBar: "#ffffff",
  tabIcon: "#8a9aa8",
  tabIconFocused: "#2a6f97",
  text: "#1e3d58",
  textSecondary: "#6b7b8c",
  border: "#e2e8f0",
  statusBar: "dark-content" as const,
  statusBarBg: "#2a6f97",
  primary: "#2a6f97",
  danger: "#d32f2f",
  warning: "#ed6c02",
  success: "#2e7d32",
  inputBg: "#f8fafc",
};

export const darkTheme = {
  background: "#121212",
  card: "#1e1e1e",
  tabBar: "#1e1e1e",
  tabIcon: "#888888",
  tabIconFocused: "#4a9eff",
  text: "#ffffff",
  textSecondary: "#aaaaaa",
  border: "#333333",
  statusBar: "light-content" as const,
  statusBarBg: "#000000",
  primary: "#4a9eff",
  danger: "#cf6679",
  warning: "#ffb74d",
  success: "#81c784",
  inputBg: "#2d2d2d",
};

type ThemeType = typeof lightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
      console.log('Theme saved:', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (isLoading) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};