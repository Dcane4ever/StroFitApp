export const DarkColors = {
  // Backgrounds
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  card: '#1E1E1E',

  // Brand
  primary: '#4CAF50',       // green — health/fitness
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  accent: '#FF6B35',        // orange — energy/cals

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#9E9E9E',
  textDisabled: '#555555',
  textInverse: '#0F0F0F',

  // Borders
  border: '#2C2C2C',
  borderFocus: '#4CAF50',

  // Status
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Macros (consistent palette across app)
  calories: '#FF6B35',
  protein: '#2196F3',
  carbs: '#FFC107',
  fat: '#9C27B0',
  fiber: '#4CAF50',

  // Tab bar
  tabBarBackground: '#141414',
  tabBarActive: '#4CAF50',
  tabBarInactive: '#555555',

  // Misc
  overlay: 'rgba(0,0,0,0.7)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const LightColors: typeof DarkColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  card: '#FFFFFF',

  primary: '#388E3C',
  primaryDark: '#2E7D32',
  primaryLight: '#4CAF50',
  accent: '#E64A19',

  textPrimary: '#111111',
  textSecondary: '#616161',
  textDisabled: '#BDBDBD',
  textInverse: '#F5F5F5',

  border: '#E0E0E0',
  borderFocus: '#388E3C',

  success: '#388E3C',
  warning: '#F57C00',
  error: '#D32F2F',
  info: '#1976D2',

  calories: '#E64A19',
  protein: '#1976D2',
  carbs: '#F57C00',
  fat: '#7B1FA2',
  fiber: '#388E3C',

  tabBarBackground: '#FFFFFF',
  tabBarActive: '#388E3C',
  tabBarInactive: '#9E9E9E',

  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type AppColors = typeof DarkColors;
