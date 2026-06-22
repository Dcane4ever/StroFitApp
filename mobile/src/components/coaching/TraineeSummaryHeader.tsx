import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { TraineeSummaryResponse, LinkStatus } from '../../types/coaching';

interface Props {
  summary: TraineeSummaryResponse;
}

const STATUS_COLORS: Record<LinkStatus, string> = {
  ACTIVE: '#4CAF50',
  PENDING: '#FFC107',
  DECLINED: '#F44336',
  REMOVED: '#9E9E9E',
};

function initials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function TraineeSummaryHeader({ summary }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const avatarText = initials(summary.traineeName, summary.traineeEmail);
  const statusColor = STATUS_COLORS[summary.status];

  const linkedDate = summary.linkedAt
    ? new Date(summary.linkedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <View style={s.card}>
      <View style={[s.avatar, { backgroundColor: colors.primary + '30' }]}>
        <Text style={[s.avatarText, { color: colors.primary }]}>{avatarText}</Text>
      </View>
      <Text style={s.name}>{summary.traineeName ?? summary.traineeEmail}</Text>
      {summary.traineeName && (
        <Text style={s.email}>{summary.traineeEmail}</Text>
      )}
      <View style={s.metaRow}>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[s.statusText, { color: statusColor }]}>{summary.status}</Text>
        </View>
        {linkedDate && (
          <Text style={s.linkedDate}>Linked {linkedDate}</Text>
        )}
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
    },
    avatarText: {
      fontSize: Typography.xl,
      fontWeight: '700',
    },
    name: {
      fontSize: Typography.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    email: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },
    statusBadge: {
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
    },
    statusText: {
      fontSize: Typography.xs,
      fontWeight: '600',
    },
    linkedDate: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
    },
  });
