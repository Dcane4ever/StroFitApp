import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, SafeAreaView,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { RecipeServingOption } from '../../types/recipe';

interface Props {
  options: RecipeServingOption[];
  selected: RecipeServingOption | null;
  onSelect: (option: RecipeServingOption) => void;
}

function servingDescription(opt: RecipeServingOption): string {
  if (opt.caloriesPerServing != null) {
    return `${opt.caloriesPerServing.toFixed(0)} kcal`;
  }
  if (opt.gramsEquivalent != null) {
    return `${opt.gramsEquivalent}g`;
  }
  if (opt.fractionOfRecipe != null) {
    return `${(opt.fractionOfRecipe * 100).toFixed(0)}% of recipe`;
  }
  return '';
}

export default function RecipeServingPicker({ options, selected, onSelect }: Props) {
  const { colors } = useThemeStore();
  const [open, setOpen] = useState(false);
  const s = styles(colors);

  if (options.length === 0) return null;

  return (
    <>
      <TouchableOpacity style={s.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <View style={s.triggerInner}>
          <Text style={s.triggerLabel}>Serving</Text>
          <Text style={s.triggerValue} numberOfLines={1}>
            {selected?.label ?? 'Select…'}
          </Text>
        </View>
        {selected && <Text style={s.triggerDesc}>{servingDescription(selected)}</Text>}
        <Text style={s.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.overlay}>
          <SafeAreaView style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Choose Serving</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={s.sheetClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={o => o.id}
              renderItem={({ item }) => {
                const isSelected = selected?.id === item.id;
                const desc = servingDescription(item);
                return (
                  <TouchableOpacity
                    style={[s.option, isSelected && s.optionSelected]}
                    onPress={() => { onSelect(item); setOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={s.optionLeft}>
                      <Text style={[s.optionText, isSelected && s.optionTextSelected]}>
                        {item.label}
                      </Text>
                      {item.isDefault && (
                        <Text style={s.defaultTag}>Default</Text>
                      )}
                    </View>
                    {desc ? <Text style={s.optionDesc}>{desc}</Text> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
    },
    triggerInner: { flex: 1 },
    triggerLabel: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    triggerValue: {
      fontSize: Typography.base,
      color: colors.textPrimary,
      fontWeight: Typography.medium,
    },
    triggerDesc: {
      fontSize: Typography.xs,
      color: colors.textSecondary,
      marginRight: Spacing.xs,
    },
    chevron: {
      fontSize: 20,
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    sheet: {
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '55%',
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    sheetTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
    },
    sheetClose: {
      fontSize: Typography.base,
      color: colors.primary,
      fontWeight: Typography.semibold,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionSelected: {
      backgroundColor: colors.primary + '18',
    },
    optionLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    optionText: {
      fontSize: Typography.base,
      color: colors.textPrimary,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: Typography.semibold,
    },
    defaultTag: {
      fontSize: Typography.xs,
      color: colors.textDisabled,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 1,
    },
    optionDesc: {
      fontSize: Typography.sm,
      color: colors.textSecondary,
    },
  });
