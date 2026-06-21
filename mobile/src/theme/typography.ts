import { Platform } from 'react-native';

const fontFamily = Platform.select({
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  fontFamily,

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;
