import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography } from '../../theme';

type Props = MainTabScreenProps<'Progress'>;

export default function ProgressScreen(_props: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Progress</Text>
      </View>
      <View style={s.placeholder}>
        <Text style={s.placeholderText}>Weight chart + stats coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof useThemeStore>['colors']) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
    headerTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: colors.textPrimary },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: colors.textDisabled, fontSize: Typography.base },
  });
