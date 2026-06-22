import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { AuthScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Spacing, BorderRadius, Typography , AppColors } from '../../theme';
import apiClient from '../../api/client';

type Props = AuthScreenProps<'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/register', { email, password });
      const { token, user } = res.data.data;
      await setAuth(token, user);
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Start tracking your nutrition</Text>

        {error && <Text style={s.errorText}>{error}</Text>}

        <TextInput
          style={s.input}
          placeholder="Email"
          placeholderTextColor={colors.textDisabled}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={s.input}
          placeholder="Password"
          placeholderTextColor={colors.textDisabled}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.textInverse} />
            : <Text style={s.btnText}>Register</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.link}>Already have an account? <Text style={s.linkBold}>Log In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
    title: {
      fontSize: Typography.xxl, fontWeight: Typography.bold,
      color: colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: Typography.base, color: colors.textSecondary,
      textAlign: 'center', marginBottom: Spacing.xxl,
    },
    errorText: {
      color: colors.error, fontSize: Typography.sm,
      marginBottom: Spacing.md, textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surface, color: colors.textPrimary,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2, fontSize: Typography.base,
      marginBottom: Spacing.md,
    },
    btn: {
      backgroundColor: colors.primary, borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md, alignItems: 'center',
      marginBottom: Spacing.lg, marginTop: Spacing.xs,
    },
    btnText: { color: colors.textInverse, fontSize: Typography.md, fontWeight: Typography.semibold },
    link: { color: colors.textSecondary, textAlign: 'center', fontSize: Typography.sm },
    linkBold: { color: colors.primary, fontWeight: Typography.semibold },
  });
