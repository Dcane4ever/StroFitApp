import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { TraineeCoachResponse, LinkStatus } from '../../types/coaching';

interface Props {
  coach: TraineeCoachResponse;
}

const STATUS_COLORS: Record<LinkStatus, string> = {
  ACTIVE: '#4CAF50',
  PENDING: '#FFC107',
  DECLINED: '#F44336',
  REMOVED: '#9E9E9E',
};

const STATUS_LABELS: Record<LinkStatus, string> = {
  ACTIVE: 'Linked',
  PENDING: 'Invite pending',
  DECLINED: 'Invite declined',
  REMOVED: 'Unlinked',
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
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

export default function CoachInfoCard({ coach }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const statusColor = STATUS_COLORS[coach.status];
  const statusLabel = STATUS_LABELS[coach.status];
  const avatarText = initials(coach.coachName, coach.coachEmail);
  const linkedStr = formatDate(coach.linkedAt ?? coach.invitedAt);

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <View style={[s.avatar, { backgroundColor: colors.accent + '25' }]}>
          <Text style={[s.avatarText, { color: colors.accent }]}>{avatarText}</Text>
        </View>
        <View style={s.identity}>
          <Text style={s.name}>{coach.coachName ?? coach.coachEmail}</Text>
          {coach.coachName && <Text style={s.email}>{coach.coachEmail}</Text>}
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {linkedStr && (
        <Text style={s.linkedDate}>
          {coach.status === 'PENDING' ? 'Invite sent' : 'Linked since'} {linkedStr}
        </Text>
      )}

      {coach.status === 'ACTIVE' && (
        <View style={s.infoRow}>
          <Text style={s.infoText}>
            Your coach can view your weight progress, diary adherence, and budget summary.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: Typography.lg,
      fontWeight: '700',
    },
    identity: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: Typography.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    email: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
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
      marginLeft: 52 + Spacing.md,
    },
    infoRow: {
      marginTop: Spacing.xs,
      padding: Spacing.sm,
      backgroundColor: colors.primary + '12',
      borderRadius: BorderRadius.sm,
    },
    infoText: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      lineHeight: Typography.xs * 1.6,
    },
  });
