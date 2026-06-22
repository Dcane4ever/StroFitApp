import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';

interface Props {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - today.getTime()) / 86400000;
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export default function DateSwitcher({ date, onPrev, onNext, onToday }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);
  const today = isToday(date);

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.arrow}
        onPress={onPrev}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={s.arrowText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.center} onPress={onToday} disabled={today}>
        <Text style={[s.dateLabel, today && { color: colors.primary }]}>
          {formatDisplayDate(date)}
        </Text>
        <Text style={s.dateSubLabel}>{formatFullDate(date)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.arrow}
        onPress={onNext}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={s.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    arrow: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowText: {
      fontSize: 22,
      color: colors.textPrimary,
      lineHeight: 26,
    },
    center: {
      flex: 1,
      alignItems: 'center',
    },
    dateLabel: {
      fontSize: Typography.lg,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    dateSubLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
  });
