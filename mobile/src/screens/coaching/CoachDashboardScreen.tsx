import React, { useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography , AppColors } from '../../theme';
import { CoachingStackScreenProps } from '../../types/navigation';
import { useCoachTrainees } from '../../hooks/queries/useCoachTrainees';
import { CoachTraineeLinkResponse } from '../../types/coaching';
import TraineeCard from '../../components/coaching/TraineeCard';
import TraineeEmptyState from '../../components/coaching/TraineeEmptyState';

type Props = CoachingStackScreenProps<'CoachDashboard'>;

export default function CoachDashboardScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);
  const { trainees, loading, error, refresh } = useCoachTrainees();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const activeTrainees = trainees.filter(t => t.status === 'ACTIVE');
  const pendingTrainees = trainees.filter(t => t.status === 'PENDING');

  const handleTraineePress = (trainee: CoachTraineeLinkResponse) => {
    if (trainee.status === 'ACTIVE') {
      navigation.navigate('TraineeSummary', {
        traineeId: trainee.traineeId,
        traineeName: trainee.traineeName ?? trainee.traineeEmail,
      });
    }
  };

  const renderHeader = () => (
    <View style={s.listHeader}>
      {pendingTrainees.length > 0 && (
        <View style={s.pendingBanner}>
          <Text style={s.pendingText}>
            {pendingTrainees.length} pending invite{pendingTrainees.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      {trainees.length > 0 && (
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>
            {activeTrainees.length} active · {pendingTrainees.length} pending
          </Text>
        </View>
      )}
    </View>
  );

  if (loading && trainees.length === 0) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error && trainees.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={s.retryBtn}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {trainees.length === 0 && !loading ? (
        <TraineeEmptyState onInvite={() => navigation.navigate('CoachInvite')} />
      ) : (
        <FlatList
          data={trainees}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TraineeCard trainee={item} onPress={() => handleTraineePress(item)} />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[s.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CoachInvite')}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>+ Invite</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
    },
    errorText: {
      fontSize: Typography.sm,
      color: colors.error,
      textAlign: 'center',
      paddingHorizontal: Spacing.xl,
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
    listContent: {
      padding: Spacing.md,
      paddingBottom: 80,
    },
    listHeader: {
      marginBottom: Spacing.sm,
    },
    pendingBanner: {
      backgroundColor: '#FFC107' + '20',
      borderRadius: 8,
      padding: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    pendingText: {
      fontSize: Typography.xs,
      color: '#FFC107',
      fontWeight: '600',
    },
    sectionRow: {
      marginBottom: Spacing.xs,
    },
    sectionLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    fab: {
      position: 'absolute',
      bottom: Spacing.xl,
      right: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm + 2,
      borderRadius: 24,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    fabText: {
      fontSize: Typography.base,
      fontWeight: '700',
      color: '#fff',
    },
  });
