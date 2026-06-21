import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius } from '../../theme';

type Props = MainTabScreenProps<'Search'>;

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

export default function SearchScreen({ route }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const context = route.params;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Search Food</Text>
        {context && (
          <View style={s.contextBadge}>
            <Text style={s.contextText}>
              {MEAL_LABELS[context.mealType] ?? context.mealType} · {context.date}
            </Text>
          </View>
        )}
      </View>
      <View style={s.placeholder}>
        <Text style={s.placeholderText}>Food search + barcode coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof useThemeStore>['colors']) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    headerTitle: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
    contextBadge: {
      marginTop: Spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: colors.primary + '22',
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
    },
    contextText: {
      fontSize: Typography.xs,
      color: colors.primary,
      fontWeight: Typography.medium,
    },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: colors.textDisabled, fontSize: Typography.base },
  });
