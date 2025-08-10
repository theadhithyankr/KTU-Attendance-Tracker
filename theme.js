// Material 3 (Material You) Dark Theme Configuration - Focus App Style
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Dark theme colors matching the Focus app aesthetic
const material3DarkColors = {
  // Primary palette - Purple/Blue accent
  primary: '#8AB4F8',
  onPrimary: '#1A1A1A',
  primaryContainer: '#2D2D30',
  onPrimaryContainer: '#E8F0FE',
  
  // Secondary palette
  secondary: '#9AA0AC',
  onSecondary: '#1A1A1A',
  secondaryContainer: '#2D2D30',
  onSecondaryContainer: '#E8EAED',
  
  // Tertiary palette
  tertiary: '#A8C7FA',
  onTertiary: '#1A1A1A',
  tertiaryContainer: '#2D2D30',
  onTertiaryContainer: '#E8F0FE',
  
  // Error palette
  error: '#F28B82',
  onError: '#1A1A1A',
  errorContainer: '#442726',
  onErrorContainer: '#FDDAD6',
  
  // Success palette
  success: '#81C995',
  onSuccess: '#1A1A1A',
  successContainer: '#2E4233',
  onSuccessContainer: '#C6F6D5',
  
  // Warning palette
  warning: '#FDD663',
  onWarning: '#1A1A1A',
  warningContainer: '#413C2B',
  onWarningContainer: '#FEF3C7',
  
  // Surface colors - Dark focus theme
  surface: '#1A1A1A',
  onSurface: '#E8EAED',
  surfaceVariant: '#2D2D30',
  onSurfaceVariant: '#9AA0AC',
  surfaceContainer: '#202124',
  surfaceContainerHigh: '#2D2D30',
  surfaceContainerHighest: '#35363A',
  
  // Background colors
  background: '#1A1A1A',
  onBackground: '#E8EAED',
  
  // Outline colors
  outline: '#5F6368',
  outlineVariant: '#35363A',
  
  // Additional colors
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E8EAED',
  inverseOnSurface: '#2D2D30',
  inversePrimary: '#1A73E8',
};

// Light theme with Material 3 style
const material3LightColors = {
  primary: '#1A73E8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8F0FE',
  onPrimaryContainer: '#1A1A1A',
  
  secondary: '#5F6368',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8EAED',
  onSecondaryContainer: '#1A1A1A',
  
  tertiary: '#1A73E8',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E8F0FE',
  onTertiaryContainer: '#1A1A1A',
  
  error: '#D93025',
  onError: '#FFFFFF',
  errorContainer: '#FDDAD6',
  onErrorContainer: '#1A1A1A',
  
  success: '#137333',
  onSuccess: '#FFFFFF',
  successContainer: '#C6F6D5',
  onSuccessContainer: '#1A1A1A',
  
  warning: '#EA8600',
  onWarning: '#FFFFFF',
  warningContainer: '#FEF3C7',
  onWarningContainer: '#1A1A1A',
  
  surface: '#FFFFFF',
  onSurface: '#1A1A1A',
  surfaceVariant: '#F8F9FA',
  onSurfaceVariant: '#5F6368',
  surfaceContainer: '#F8F9FA',
  surfaceContainerHigh: '#F1F3F4',
  surfaceContainerHighest: '#E8EAED',
  
  background: '#FFFFFF',
  onBackground: '#1A1A1A',
  
  outline: '#9AA0AC',
  outlineVariant: '#E8EAED',
  
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#2D2D30',
  inverseOnSurface: '#E8EAED',
  inversePrimary: '#8AB4F8',
};

// Dark Theme Configuration (Focus app style)
export const material3DarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    ...material3DarkColors,
  },
  roundness: 16, // More rounded like Focus app
};

// Light Theme Configuration  
export const material3LightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    ...material3LightColors,
  },
  roundness: 16,
};

// Material 3 Typography Scale (Focus app style)
export const material3Typography = {
  displayLarge: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -0.25,
    fontWeight: '300',
  },
  displayMedium: {
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: 0,
    fontWeight: '300',
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '400',
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '500',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
};

// Material 3 Elevation Tokens (Focus app style)
export const material3Elevation = {
  level0: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 8,
  },
  level4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 12,
  },
  level5: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
  },
};

export default {
  light: material3LightTheme,
  dark: material3DarkTheme,
  typography: material3Typography,
  elevation: material3Elevation,
};
