import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { CoachTraineeLinkResponse, LinkStatus } from '../../types/coaching';

interface Props {
  trainee: CoachTraineeLinkResponse;
  onPress: () => void;
}

const STATUS_COLORS: Record<LinkStatus, string> = {
  ACTIVE: '#4CAF50',
  PENDING: '#FFC107',
  DECLINED: '#F44336',
  REMOVED: '#9E9E9E',
};

const STATUS_LABELS: Record<LinkStatus, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  DECLINED: 'Declined',
  REMOVED: 'Removed',
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function TraineeCard({ trainee, onPress }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const statusColor = STATUS_COLORS[trainee.status];
  const statusLabel = STATUS_LABELS[trainee.status];
  const linkedStr = formatDate(trainee.linkedAt ?? trainee.invitedAt);
  const avatarText = initials(trainee.traineeName, trainee.traineeEmail);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.avatar, { backgroundColor: colors.primary + '30' }]}>
        <Text style={[s.avatarText, { color: colors.primary }]}>{avatarText}</Text>
      </View>

      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>
          {trainee.traineeName ?? trainee.traineeEmail}
        </Text>
        {trainee.traineeName && (
          <Text style={s.email} numberOfLines={1}>{trainee.traineeEmail}</Text>
        )}
        {linkedStr && (
          <Text style={s.date}>
            {trainee.status === 'PENDING' ? 'Invited' : 'Linked'} {linkedStr}
          </Text>
        )}
      </View>

      <View style={s.right}>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        {trainee.status === 'ACTIVE' && (
          <Text style={s.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: Typography.base,
      fontWeight: '700',
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: Typography.base,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    email: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
    },
    date: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    right: {
      alignItems: 'flex-end',
      gap: Spacing.xs,
    },
    statusBadge: {
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
    },
    statusText: {
      fontSize: Typography.xs,
      fontWeight: '600',
    },
    chevron: {
      fontSize: Typography.xl,
      color: colors.textDisabled,
      lineHeight: Typography.xl,
    },
  });
