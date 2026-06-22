import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { WeightLog, WeightUnit } from '../../types/weight';
import { addWeightLog, updateWeightLog, deleteWeightLog } from '../../api/weight';

interface Props {
  visible: boolean;
  editLog: WeightLog | null;   // null = add mode, non-null = edit mode
  onClose: () => void;
  onSaved: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddWeightModal({ visible, editLog, onClose, onSaved }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  const isEdit = editLog != null;

  const [weightText, setWeightText] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('KG');
  const [dateText, setDateText] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editLog != null) {
      setWeightText(editLog.weightValue.toString());
      setUnit(editLog.weightUnit);
      setDateText(editLog.loggedAt.slice(0, 10));
      setNotes(editLog.notes ?? '');
    } else {
      setWeightText('');
      setUnit('KG');
      setDateText(todayISO());
      setNotes('');
    }
    setError(null);
  }, [editLog, visible]);

  const weightNum = parseFloat(weightText);
  const isValid = !isNaN(weightNum) && weightNum > 0 && dateText.length === 10;

  const handleSave = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        weightValue: weightNum,
        weightUnit: unit,
        loggedAt: dateText,
        notes: notes.trim() || null,
      };
      if (isEdit && editLog != null) {
        await updateWeightLog(editLog.id, payload);
      } else {
        await addWeightLog(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
          <SafeAreaView style={s.sheet}>
            {/* Header */}
            <View style={s.header}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={s.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={s.title}>{isEdit ? 'Edit Weigh-in' : 'Log Weigh-in'}</Text>
              <TouchableOpacity onPress={handleSave} disabled={!isValid || loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {loading
                  ? <ActivityIndicator color={colors.primary} size="small" />
                  : <Text style={[s.save, (!isValid) && s.saveDisabled]}>Save</Text>
                }
              </TouchableOpacity>
            </View>

            <View style={s.body}>
              {/* Weight + unit row */}
              <Text style={s.fieldLabel}>Weight</Text>
              <View style={s.weightRow}>
                <TextInput
                  style={[s.weightInput, !isValid && weightText.length > 0 && s.inputError]}
                  value={weightText}
                  onChangeText={setWeightText}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 72.5"
                  placeholderTextColor={colors.textDisabled}
                  selectTextOnFocus
                  autoFocus={!isEdit}
                />
                <View style={s.unitToggle}>
                  {(['KG', 'LBS'] as WeightUnit[]).map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[s.unitBtn, unit === u && s.unitBtnActive]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[s.unitBtnText, unit === u && s.unitBtnTextActive]}>
                        {u.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <Text style={s.fieldLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={s.input}
                value={dateText}
                onChangeText={setDateText}
                placeholder="2026-06-21"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />

              {/* Notes */}
              <Text style={s.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={[s.input, s.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. morning, after workout…"
                placeholderTextColor={colors.textDisabled}
                multiline
                maxLength={200}
              />

              {error != null && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    kav: { justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    cancel: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      width: 60,
    },
    title: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    save: {
      fontSize: Typography.base,
      color: colors.primary,
      fontWeight: Typography.semibold,
      width: 60,
      textAlign: 'right',
    },
    saveDisabled: { opacity: 0.35 },
    body: {
      padding: Spacing.md,
      paddingBottom: Spacing.xl,
    },
    fieldLabel: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    weightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    weightInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      fontSize: Typography.xxl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    inputError: { borderColor: colors.error },
    unitToggle: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    },
    unitBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      backgroundColor: colors.surface,
    },
    unitBtnActive: { backgroundColor: colors.primary },
    unitBtnText: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      fontWeight: Typography.medium,
    },
    unitBtnTextActive: { color: colors.textInverse, fontWeight: Typography.bold },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      fontSize: Typography.base,
      color: colors.textPrimary,
    },
    notesInput: {
      minHeight: 64,
      textAlignVertical: 'top',
    },
    errorBox: {
      marginTop: Spacing.md,
      backgroundColor: colors.error + '22',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    },
    errorText: {
      color: colors.error,
      fontSize: Typography.sm,
    },
  });
