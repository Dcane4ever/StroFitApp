import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { CoachingStackScreenProps } from '../../types/navigation';
import { inviteTrainee } from '../../api/coaching';
import { queryClient } from '../../providers/QueryProvider';
import { QK } from '../../lib/queryKeys';

type Props = CoachingStackScreenProps<'CoachInvite'>;

type ScreenState = 'idle' | 'loading' | 'success';

export default function CoachInviteScreen({ navigation }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const [email, setEmail] = useState('');
  const [state, setState] = useState<ScreenState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState('');

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter the trainee\'s email address.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setState('loading');
    setError(null);
    try {
      await inviteTrainee({ traineeEmail: trimmed });
      queryClient.invalidateQueries({ queryKey: QK.coachTrainees() });
      setSuccessEmail(trimmed);
      setState('success');
    } catch (err: any) {
      setState('idle');
      const msg = err?.message ?? 'Failed to send invite. Please try again.';
      setError(msg);
    }
  };

  if (state === 'success') {
    return (
      <View style={s.centered}>
        <Text style={s.successIcon}>✓</Text>
        <Text style={s.successTitle}>Invite Sent</Text>
        <Text style={s.successBody}>
          An invite has been sent to{'\n'}
          <Text style={s.successEmail}>{successEmail}</Text>
        </Text>
        <Text style={[s.successHint, { color: colors.textDisabled }]}>
          They'll appear in your trainee list once they accept.
        </Text>
        <TouchableOpacity
          style={[s.doneBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.doneBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.content}>
        <Text style={s.heading}>Invite a Trainee</Text>
        <Text style={s.subheading}>
          Enter your client's email address. They will receive a link request to connect with you as their coach.
        </Text>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Trainee Email</Text>
          <TextInput
            style={[
              s.input,
              {
                color: colors.textPrimary,
                borderColor: error ? colors.error : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            value={email}
            onChangeText={t => { setEmail(t); setError(null); }}
            placeholder="client@example.com"
            placeholderTextColor={colors.textDisabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          {error && <Text style={[s.errorText, { color: colors.error }]}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: colors.primary }, state === 'loading' && { opacity: 0.7 }]}
          onPress={handleSend}
          disabled={state === 'loading'}
          activeOpacity={0.8}
        >
          {state === 'loading'
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.sendBtnText}>Send Invite</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    heading: {
      fontSize: Typography.xl,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    subheading: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      lineHeight: Typography.sm * 1.6,
    },
    field: {
      gap: Spacing.xs,
      marginTop: Spacing.sm,
    },
    fieldLabel: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: Typography.base,
    },
    errorText: {
      fontSize: Typography.xs,
      marginTop: 2,
    },
    sendBtn: {
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    sendBtnText: {
      fontSize: Typography.base,
      fontWeight: '700',
      color: '#fff',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      gap: Spacing.md,
      backgroundColor: colors.background,
    },
    successIcon: {
      fontSize: 56,
      color: colors.primary,
    },
    successTitle: {
      fontSize: Typography.xl,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    successBody: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.base * 1.6,
    },
    successEmail: {
      fontWeight: '700',
      color: colors.textPrimary,
    },
    successHint: {
      fontSize: Typography.xs,
      textAlign: 'center',
    },
    doneBtn: {
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    doneBtnText: {
      fontSize: Typography.base,
      fontWeight: '700',
      color: '#fff',
    },
  });
