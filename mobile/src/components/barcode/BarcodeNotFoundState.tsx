import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';

interface Props {
  barcode: string;
  onScanAgain: () => void;
  onSearchManually: () => void;
}

export default function BarcodeNotFoundState({ barcode, onScanAgain, onSearchManually }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  return (
    <View style={s.root}>
      <Text style={s.icon}>📦</Text>
      <Text style={s.title}>Product not found</Text>
      <Text style={s.barcode}>{barcode}</Text>
      <Text style={s.body}>
        This barcode isn't in the database yet. Try searching by name instead — or scan again if the camera didn't read it clearly.
      </Text>

      <TouchableOpacity style={s.primaryBtn} onPress={onScanAgain}>
        <Text style={s.primaryBtnText}>Scan Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.secondaryBtn} onPress={onSearchManually}>
        <Text style={s.secondaryBtnText}>Search Manually</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    icon: { fontSize: 56, marginBottom: Spacing.md },
    title: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    barcode: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      fontFamily: 'monospace',
      marginBottom: Spacing.md,
    },
    body: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.base * 1.5,
      marginBottom: Spacing.xl,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
      width: '100%',
      alignItems: 'center',
    },
    primaryBtnText: {
      color: colors.textInverse,
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
    },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      width: '100%',
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: colors.textPrimary,
      fontSize: Typography.base,
    },
  });
