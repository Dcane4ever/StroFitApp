import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';

type BannerVariant = 'info' | 'warning' | 'error' | 'success';

interface Props {
  message: string;
  variant?: BannerVariant;
  actionLabel?: string;
  onAction?: () => void;
}

export default function InlineInfoBanner({
  message, variant = 'info', actionLabel, onAction,
}: Props) {
  const { colors } = useThemeStore();

  const accentColor: Record<BannerVariant, string> = {
    info: colors.info,
    warning: colors.warning,
    error: colors.error,
    success: colors.success,
  };

  const color = accentColor[variant];

  return (
    <View style={[styles.banner, { backgroundColor: color + '18', borderLeftColor: color }]}>
      <Text style={[styles.message, { color: colors.textSecondary, flex: 1 }]}>{message}</Text>
      {actionLabel != null && onAction != null && (
        <TouchableOpacity onPress={onAction} style={styles.action}>
          <Text style={[styles.actionText, { color }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  message: {
    fontSize: Typography.sm,
    lineHeight: Typography.sm * 1.5,
  },
  action: {
    paddingHorizontal: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
});
