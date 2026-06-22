import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Typography, BorderRadius } from '../../theme';

type PillVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface Props {
  label: string;
  variant?: PillVariant;
  style?: ViewStyle;
}

export default function Pill({ label, variant = 'default', style }: Props) {
  const { colors } = useThemeStore();

  const map: Record<PillVariant, { bg: string; fg: string }> = {
    default:  { bg: colors.border,            fg: colors.textDisabled },
    primary:  { bg: colors.primary + '25',    fg: colors.primary },
    success:  { bg: colors.success + '22',    fg: colors.success },
    warning:  { bg: colors.warning + '25',    fg: colors.warning },
    error:    { bg: colors.error + '22',      fg: colors.error },
    info:     { bg: colors.info + '22',       fg: colors.info },
    muted:    { bg: colors.surface,           fg: colors.textSecondary },
  };

  const { bg, fg } = map[variant];

  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
