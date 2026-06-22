import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function AppButton({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, style,
}: Props) {
  const { colors } = useThemeStore();

  const bg: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.surface,
    danger: colors.error,
    ghost: colors.transparent,
  };

  const fg: Record<Variant, string> = {
    primary: colors.textInverse,
    secondary: colors.textPrimary,
    danger: '#FFFFFF',
    ghost: colors.primary,
  };

  const border: Record<Variant, string | undefined> = {
    primary: undefined,
    secondary: colors.border,
    danger: undefined,
    ghost: undefined,
  };

  const py: Record<Size, number> = {
    sm: Spacing.xs + 2,
    md: Spacing.sm + 4,
    lg: Spacing.md,
  };

  const fontSize: Record<Size, number> = {
    sm: Typography.sm,
    md: Typography.base,
    lg: Typography.md,
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: bg[variant],
          borderColor: border[variant],
          borderWidth: border[variant] ? 1 : 0,
          paddingVertical: py[size],
          alignSelf: fullWidth ? undefined : 'flex-start',
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={fg[variant]} size="small" />
        : <Text style={[styles.label, { color: fg[variant], fontSize: fontSize[size] }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  label: {
    fontWeight: '600',
  },
});
