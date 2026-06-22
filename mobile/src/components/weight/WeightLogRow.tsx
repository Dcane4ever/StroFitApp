import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { WeightLog } from '../../types/weight';

interface Props {
  log: WeightLog;
  onEdit: (log: WeightLog) => void;
  onDelete: (log: WeightLog) => void;
}

function formatLogDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WeightLogRow({ log, onEdit, onDelete }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      `Remove ${log.weightValue} ${log.weightUnit.toLowerCase()} on ${formatLogDate(log.loggedAt)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(log) },
      ],
    );
  };

  const unit = log.weightUnit === 'LBS' ? 'lbs' : 'kg';

  return (
    <View style={s.row}>
      <View style={s.left}>
        <Text style={s.weight}>{log.weightValue.toFixed(1)} <Text style={s.unit}>{unit}</Text></Text>
        <Text style={s.date}>{formatLogDate(log.loggedAt)}</Text>
        {log.notes != null && log.notes.length > 0 && (
          <Text style={s.notes} numberOfLines={1}>{log.notes}</Text>
        )}
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onEdit(log)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    left: { flex: 1 },
    weight: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    unit: {
      fontSize: Typography.sm,
      fontWeight: Typography.regular,
      color: colors.textSecondary,
    },
    date: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    notes: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      fontStyle: 'italic',
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    actionBtn: {
      paddingVertical: 4,
    },
    editText: {
      fontSize: Typography.sm,
      color: colors.primary,
      fontWeight: Typography.medium,
    },
    deleteText: {
      fontSize: Typography.sm,
      color: colors.error,
      fontWeight: Typography.medium,
    },
  });
