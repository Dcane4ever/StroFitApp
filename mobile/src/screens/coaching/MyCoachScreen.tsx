import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { CoachingStackScreenProps } from '../../types/navigation';
import { useMyCoach } from '../../hooks/queries/useMyCoach';
import CoachInfoCard from '../../components/coaching/CoachInfoCard';

type Props = CoachingStackScreenProps<'MyCoach'>;

export default function MyCoachScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const { coach, loading, error, refresh } = useMyCoach();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={s.retryBtn}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!coach) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyIcon}>🏋️</Text>
        <Text style={s.emptyTitle}>No Coach Linked</Text>
        <Text style={s.emptyBody}>
          No coach linked yet. Ask your coach to send an invite using your registered email address.
        </Text>
        <View style={s.infoCard}>
          <Text style={s.infoText}>
            Once linked, your coach can monitor your weight trend, diary consistency, and food budget — helping you stay on track.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={s.sectionLabel}>Your Coach</Text>
      <CoachInfoCard coach={coach} />

      {coach.status === 'ACTIVE' && (
        <View style={s.visibilityCard}>
          <Text style={s.visibilityTitle}>What your coach can see</Text>
          {[
            'Weight logs and trend',
            'Diary logging consistency',
            'Average daily nutrition',
            'Budget adherence summary',
          ].map((item, i) => (
            <View key={i} style={s.visibilityRow}>
              <Text style={s.visibilityDot}>·</Text>
              <Text style={s.visibilityItem}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {coach.status === 'PENDING' && (
        <View style={[s.statusNote, { backgroundColor: '#FFC107' + '15', borderColor: '#FFC107' + '40' }]}>
          <Text style={[s.statusNoteText, { color: '#FFC107' }]}>
            Your coach's invite is pending. The link will activate once the connection is confirmed.
          </Text>
        </View>
      )}

      {coach.status === 'DECLINED' && (
        <View style={[s.statusNote, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]}>
          <Text style={[s.statusNoteText, { color: colors.error }]}>
            This coaching link was declined. Contact your coach to resend an invite.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxxl,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      gap: Spacing.md,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: Typography.sm,
      color: colors.error,
      textAlign: 'center',
    },
    retryBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    retryText: {
      fontSize: Typography.sm,
      color: colors.primary,
      fontWeight: '500',
    },
    emptyIcon: {
      fontSize: 48,
    },
    emptyTitle: {
      fontSize: Typography.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptyBody: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.sm * 1.6,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginTop: Spacing.sm,
    },
    infoText: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      lineHeight: Typography.xs * 1.7,
      textAlign: 'center',
    },
    sectionLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
    },
    visibilityCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginTop: Spacing.sm,
      gap: Spacing.xs,
    },
    visibilityTitle: {
      fontSize: Typography.sm,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    visibilityRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    visibilityDot: {
      fontSize: Typography.base,
      color: colors.primary,
      lineHeight: Typography.base * 1.4,
    },
    visibilityItem: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      lineHeight: Typography.sm * 1.5,
      flex: 1,
    },
    statusNote: {
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      padding: Spacing.md,
      marginTop: Spacing.sm,
    },
    statusNoteText: {
      fontSize: Typography.sm,
      lineHeight: Typography.sm * 1.5,
    },
  });
