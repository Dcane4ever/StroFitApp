import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { AuthScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Spacing, BorderRadius, Typography , AppColors } from '../../theme';
import apiClient from '../../api/client';

type Props = AuthScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      await setAuth(token, user);
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
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
      <View style={s.inner}>
        <Text style={s.title}>StroFit</Text>
        <Text style={s.subtitle}>Track. Eat. Grow.</Text>

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

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.textInverse} />
            : <Text style={s.btnText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>Don't have an account? <Text style={s.linkBold}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
    title: {
      fontSize: Typography.xxxl, fontWeight: Typography.bold,
      color: colors.primary, textAlign: 'center', marginBottom: Spacing.xs,
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
