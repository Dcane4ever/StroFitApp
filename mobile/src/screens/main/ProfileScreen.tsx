import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MainTabScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Spacing, BorderRadius, Typography , AppColors } from '../../theme';

type Props = MainTabScreenProps<'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { colors, isDark, toggleTheme } = useThemeStore();
  const { user, clearAuth } = useAuthStore();
  const s = styles(colors);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <View style={s.section}>
        <Text style={s.label}>Email</Text>
        <Text style={s.value}>{user?.email ?? '—'}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.label}>Role</Text>
        <Text style={s.value}>{user?.role ?? '—'}</Text>
      </View>

      <TouchableOpacity style={s.row} onPress={toggleTheme}>
        <Text style={s.rowText}>Theme</Text>
        <Text style={s.rowValue}>{isDark ? 'Dark' : 'Light'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.row}
        onPress={() => navigation.navigate('Recipes')}
      >
        <Text style={s.rowText}>My Recipes</Text>
        <Text style={s.rowChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.row}
        onPress={() => navigation.navigate('Planner')}
      >
        <Text style={s.rowText}>Planner & Budget</Text>
        <Text style={s.rowChevron}>›</Text>
      </TouchableOpacity>

      {user?.role === 'COACH' || user?.role === 'ADMIN' ? (
        <TouchableOpacity
          style={s.row}
          onPress={() => navigation.navigate('Coaching', { initialScreen: 'CoachDashboard' })}
        >
          <Text style={s.rowText}>My Trainees</Text>
          <Text style={s.rowChevron}>›</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={s.row}
          onPress={() => navigation.navigate('Coaching', { initialScreen: 'MyCoach' })}
        >
          <Text style={s.rowText}>My Coach</Text>
          <Text style={s.rowChevron}>›</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.logoutBtn} onPress={clearAuth}>
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
    headerTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: colors.textPrimary },
    section: {
      marginHorizontal: Spacing.md, marginTop: Spacing.md,
      backgroundColor: colors.surface, borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    label: { fontSize: Typography.xs, color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
    value: { fontSize: Typography.base, color: colors.textPrimary, fontWeight: Typography.medium },
    row: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginHorizontal: Spacing.md, marginTop: Spacing.md,
      backgroundColor: colors.surface, borderRadius: BorderRadius.md,
      padding: Spacing.md,
    },
    rowText: { fontSize: Typography.base, color: colors.textPrimary },
    rowValue: { fontSize: Typography.base, color: colors.textSecondary },
    rowChevron: { fontSize: 20, color: colors.textDisabled },
    logoutBtn: {
      marginHorizontal: Spacing.md, marginTop: Spacing.xl,
      backgroundColor: colors.error, borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md, alignItems: 'center',
    },
    logoutText: { color: colors.white, fontSize: Typography.base, fontWeight: Typography.semibold },
  });
