import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';

interface Props {
  date: string;          // YYYY-MM-DD
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diff = (target.getTime() - today.getTime()) / 86400000;
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';

  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export default function DateSwitcher({ date, onPrev, onNext, onToday }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  return (
    <View style={s.row}>
      <TouchableOpacity style={s.arrow} onPress={onPrev} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={s.arrowText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.center} onPress={onToday} disabled={isToday(date)}>
        <Text style={s.dateLabel}>{formatDisplayDate(date)}</Text>
        <Text style={s.dateSubLabel}>
          {new Date(date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.arrow} onPress={onNext} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={s.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useThemeStore>['colors']) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
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
