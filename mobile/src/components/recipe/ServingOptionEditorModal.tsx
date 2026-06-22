import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Switch,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { RecipeServingOption } from '../../types/recipe';
import { addRecipeServingOption, updateRecipeServingOption } from '../../api/recipe';

type ServingMode = 'fraction' | 'grams';

interface Props {
  visible: boolean;
  recipeId: string;
  editOption: RecipeServingOption | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ServingOptionEditorModal({
  visible, recipeId, editOption, onClose, onSaved,
}: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);
  const isEdit = editOption != null;

  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<ServingMode>('fraction');
  const [fractionText, setFractionText] = useState('');  // e.g. "0.5" = half recipe
  const [gramsText, setGramsText] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editOption != null) {
      setLabel(editOption.label);
      setIsDefault(editOption.isDefault);
      if (editOption.fractionOfRecipe != null) {
        setMode('fraction');
        setFractionText(editOption.fractionOfRecipe.toString());
        setGramsText('');
      } else {
        setMode('grams');
        setGramsText(editOption.gramsEquivalent?.toString() ?? '');
        setFractionText('');
      }
    } else {
      setLabel('');
      setMode('fraction');
      setFractionText('');
      setGramsText('');
      setIsDefault(false);
    }
    setError(null);
  }, [editOption, visible]);

  const fractionNum = parseFloat(fractionText);
  const gramsNum = parseFloat(gramsText);
  const isValid =
    label.trim().length > 0 &&
    (mode === 'fraction'
      ? !isNaN(fractionNum) && fractionNum > 0 && fractionNum <= 1
      : !isNaN(gramsNum) && gramsNum > 0);

  const handleSave = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        label: label.trim(),
        isDefault,
        fractionOfRecipe: mode === 'fraction' ? fractionNum : null,
        gramsEquivalent: mode === 'grams' ? gramsNum : null,
      };
      if (isEdit && editOption != null) {
        await updateRecipeServingOption(recipeId, editOption.id, payload);
      } else {
        await addRecipeServingOption(recipeId, payload);
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
            <View style={s.header}>
              <TouchableOpacity onPress={onClose}>
                <Text style={s.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={s.title}>{isEdit ? 'Edit Serving' : 'Add Serving Option'}</Text>
              <TouchableOpacity onPress={handleSave} disabled={!isValid || loading}>
                {loading
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Text style={[s.save, !isValid && s.saveDisabled]}>Save</Text>
                }
              </TouchableOpacity>
            </View>

            <View style={s.body}>
              <Text style={s.fieldLabel}>Label</Text>
              <TextInput
                style={s.input}
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. 1 serving, 1 cup, half recipe…"
                placeholderTextColor={colors.textDisabled}
                autoFocus={!isEdit}
              />

              {/* Mode toggle: fraction vs grams */}
              <Text style={s.fieldLabel}>Measurement type</Text>
              <View style={s.modeRow}>
                <TouchableOpacity
                  style={[s.modeBtn, mode === 'fraction' && s.modeBtnActive]}
                  onPress={() => setMode('fraction')}
                >
                  <Text style={[s.modeBtnText, mode === 'fraction' && s.modeBtnTextActive]}>
                    Fraction of recipe
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modeBtn, mode === 'grams' && s.modeBtnActive]}
                  onPress={() => setMode('grams')}
                >
                  <Text style={[s.modeBtnText, mode === 'grams' && s.modeBtnTextActive]}>
                    Weight (g)
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === 'fraction' ? (
                <>
                  <Text style={s.fieldLabel}>Fraction (0.01 – 1.0)</Text>
                  <TextInput
                    style={s.input}
                    value={fractionText}
                    onChangeText={setFractionText}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 0.5 for half recipe, 0.25 for quarter"
                    placeholderTextColor={colors.textDisabled}
                    selectTextOnFocus
                  />
                  <Text style={s.hint}>
                    {fractionText && !isNaN(fractionNum)
                      ? `= ${(fractionNum * 100).toFixed(0)}% of total recipe`
                      : 'Enter fraction (0.1 = 10%, 0.5 = 50%, 1 = whole recipe)'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={s.fieldLabel}>Grams per serving</Text>
                  <TextInput
                    style={s.input}
                    value={gramsText}
                    onChangeText={setGramsText}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 150"
                    placeholderTextColor={colors.textDisabled}
                    selectTextOnFocus
                  />
                  <Text style={s.hint}>
                    Nutrition will scale to the exact gram weight entered.
                  </Text>
                </>
              )}

              <View style={s.defaultRow}>
                <Text style={s.defaultLabel}>Set as default serving</Text>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={isDefault ? colors.white : colors.textDisabled}
                />
              </View>

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
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
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
    cancel: { fontSize: Typography.base, color: colors.textSecondary, width: 60 },
    title: { fontSize: Typography.md, fontWeight: Typography.semibold, color: colors.textPrimary },
    save: { fontSize: Typography.base, color: colors.primary, fontWeight: Typography.semibold, width: 60, textAlign: 'right' },
    saveDisabled: { opacity: 0.35 },
    body: { padding: Spacing.md, paddingBottom: Spacing.xl },
    fieldLabel: {
      fontSize: Typography.xs, color: colors.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.7,
      marginBottom: Spacing.sm, marginTop: Spacing.md,
    },
    input: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2, fontSize: Typography.base,
      color: colors.textPrimary,
    },
    hint: { fontSize: Typography.xs, color: colors.textDisabled, marginTop: Spacing.xs },
    modeRow: { flexDirection: 'row', gap: Spacing.sm },
    modeBtn: {
      flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
      borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
    },
    modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    modeBtnText: { fontSize: Typography.sm, color: colors.textSecondary },
    modeBtnTextActive: { color: colors.textInverse, fontWeight: Typography.semibold },
    defaultRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginTop: Spacing.lg,
    },
    defaultLabel: { fontSize: Typography.base, color: colors.textPrimary },
    errorBox: {
      marginTop: Spacing.md, backgroundColor: colors.error + '22',
      borderRadius: BorderRadius.md, padding: Spacing.sm,
    },
    errorText: { color: colors.error, fontSize: Typography.sm },
  });
