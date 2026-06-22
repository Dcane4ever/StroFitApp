import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography } from '../../theme';

interface Props {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, count, actionLabel, onAction }: Props) {
  const { colors } = useThemeStore();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {title}{count != null ? ` (${count})` : ''}
      </Text>
      {actionLabel != null && onAction != null && (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: Typography.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  action: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
});
