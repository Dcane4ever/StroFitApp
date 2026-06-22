import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { useWeightData } from '../../hooks/queries/useWeightData';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';
import { deleteWeightLog } from '../../api/weight';
import { WeightLog } from '../../types/weight';
import WeightSummaryCard from '../../components/weight/WeightSummaryCard';
import WeightChartCard from '../../components/weight/WeightChartCard';
import WeightLogRow from '../../components/weight/WeightLogRow';
import WeightEmptyState from '../../components/weight/WeightEmptyState';
import AddWeightModal from '../../components/weight/AddWeightModal';

type Props = MainTabScreenProps<'Progress'>;

export default function ProgressScreen(_props: Props) {
  const { colors } = useThemeStore();
  const { logs, summary, loading, error, refresh } = useWeightData();

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<WeightLog | null>(null);

  // Refetch when tab gains focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const openAdd = () => {
    setEditTarget(null);
    setModalVisible(true);
  };

  const openEdit = (log: WeightLog) => {
    setEditTarget(log);
    setModalVisible(true);
  };

  const invalidateWeight = () => {
    queryClient.invalidateQueries({ queryKey: QK.weightLogs() });
    queryClient.invalidateQueries({ queryKey: QK.weightSummary() });
  };

  const handleDelete = useCallback(async (log: WeightLog) => {
    try {
      await deleteWeightLog(log.id);
      invalidateWeight();
    } catch {
      // Error already surfaced via Alert in WeightLogRow
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaved = useCallback(() => {
    invalidateWeight();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const s = styles(colors);

  // Reverse for display: newest first in log list
  const displayLogs = [...logs].reverse();
  const isEmpty = !loading && logs.length === 0;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Progress</Text>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>+ Log Weight</Text>
        </TouchableOpacity>
      </View>

      {loading && logs.length === 0 ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isEmpty ? (
        <WeightEmptyState onAdd={openAdd} />
      ) : (
        <ScrollView
          style={s.scroll}
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
          {error != null && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {summary != null && <WeightSummaryCard summary={summary} />}

          <WeightChartCard logs={logs} />

          {/* Log history */}
          <View style={s.historySection}>
            <Text style={s.sectionLabel}>History</Text>
            <View style={s.historyCard}>
              {displayLogs.map(log => (
                <WeightLogRow
                  key={log.id}
                  log={log}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}

      <AddWeightModal
        visible={modalVisible}
        editLog={editTarget}
        onClose={() => setModalVisible(false)}
        onSaved={handleSaved}
      />
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    addBtn: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
    },
    addBtnText: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.textInverse,
    },
    scroll: { flex: 1 },
    content: { paddingTop: Spacing.xs },
    loadingCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorBanner: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      backgroundColor: colors.error + '22',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    },
    errorText: {
      color: colors.error,
      fontSize: Typography.sm,
    },
    historySection: {
      marginHorizontal: Spacing.md,
      marginTop: Spacing.sm,
    },
    sectionLabel: {
      fontSize: Typography.xs,
      fontWeight: Typography.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
    },
    historyCard: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
  });
