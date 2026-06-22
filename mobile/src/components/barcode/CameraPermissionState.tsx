import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { CameraPermissionStatus } from '../../hooks/useBarcodeScanner';

interface Props {
  status: CameraPermissionStatus;
  onRequest: () => void;
}

export default function CameraPermissionState({ status, onRequest }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  if (status === 'checking') {
    return (
      <View style={s.root}>
        <Text style={s.icon}>📷</Text>
        <Text style={s.title}>Checking camera…</Text>
      </View>
    );
  }

  if (status === 'blocked') {
    return (
      <View style={s.root}>
        <Text style={s.icon}>🚫</Text>
        <Text style={s.title}>Camera access blocked</Text>
        <Text style={s.body}>
          Camera permission was permanently denied. Open Settings and enable it for StroFit.
        </Text>
        <TouchableOpacity style={s.btn} onPress={() => Linking.openSettings()}>
          <Text style={s.btnText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Text style={s.icon}>📷</Text>
      <Text style={s.title}>Camera permission needed</Text>
      <Text style={s.body}>
        StroFit needs camera access to scan barcodes on packaged foods.
      </Text>
      <TouchableOpacity style={s.btn} onPress={onRequest}>
        <Text style={s.btnText}>Allow Camera</Text>
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
      backgroundColor: colors.background,
    },
    icon: { fontSize: 56, marginBottom: Spacing.lg },
    title: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    body: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.base * 1.5,
      marginBottom: Spacing.xl,
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
    },
    btnText: {
      color: colors.textInverse,
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
    },
  });
