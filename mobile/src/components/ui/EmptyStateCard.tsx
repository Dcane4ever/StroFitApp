import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography } from '../../theme';
import AppButton from './AppButton';

interface Props {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export default function EmptyStateCard({
  icon, title, body, actionLabel, onAction, style, compact = false,
}: Props) {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.root, compact && styles.rootCompact, style]}>
      {icon != null && (
        <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
      )}
      <Text style={[styles.title, { color: colors.textPrimary }, compact && styles.titleCompact]}>
        {title}
      </Text>
      {body != null && (
        <Text style={[styles.body, { color: colors.textSecondary }, compact && styles.bodyCompact]}>
          {body}
        </Text>
      )}
      {actionLabel != null && onAction != null && (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={{ marginTop: Spacing.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  rootCompact: {
    paddingVertical: Spacing.xl,
    flex: undefined,
  },
  icon: {
    fontSize: 52,
    marginBottom: Spacing.sm,
  },
  iconCompact: {
    fontSize: 36,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: Typography.base,
  },
  body: {
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: Typography.base * 1.6,
  },
  bodyCompact: {
    fontSize: Typography.sm,
    lineHeight: Typography.sm * 1.55,
  },
});
