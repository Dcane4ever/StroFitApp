import React, { useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  loading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function FoodSearchBar({
  value, onChangeText, loading, placeholder = 'Search foods…', autoFocus = false,
}: Props) {
  const { colors } = useThemeStore();
  const inputRef = useRef<TextInput>(null);
  const s = styles(colors);

  return (
    <View style={s.wrapper}>
      <View style={s.iconSlot}>
        {loading
          ? <ActivityIndicator size="small" color={colors.primary} />
          : <Text style={s.searchIcon}>⌕</Text>
        }
      </View>
      <TextInput
        ref={inputRef}
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <TouchableOpacity style={s.clearBtn} onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.sm,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
    },
    iconSlot: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchIcon: {
      fontSize: 18,
      color: colors.textDisabled,
    },
    input: {
      flex: 1,
      fontSize: Typography.base,
      color: colors.textPrimary,
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.xs,
    },
    clearBtn: {
      paddingHorizontal: Spacing.xs,
    },
    clearText: {
      fontSize: 13,
      color: colors.textDisabled,
    },
  });
