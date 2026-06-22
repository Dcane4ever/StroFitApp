import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { MainStackScreenProps } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { lookupBarcode } from '../../api/barcode';
import { BarcodeLookupResponse } from '../../types/barcode';
import { FoodDetail } from '../../types/food';
import BarcodeResultCard from '../../components/barcode/BarcodeResultCard';
import BarcodeNotFoundState from '../../components/barcode/BarcodeNotFoundState';

type Props = MainStackScreenProps<'BarcodeResult'>;

type ScreenState =
  | { phase: 'loading' }
  | { phase: 'found'; result: BarcodeLookupResponse }
  | { phase: 'not_found'; barcode: string }
  | { phase: 'error'; message: string; barcode: string };

function toFoodDetail(result: BarcodeLookupResponse): FoodDetail {
  return {
    foodItemId: result.foodItemId ?? '',
    foodName: result.foodName ?? 'Unknown Product',
    brandName: result.brandName,
    brandedProductId: result.brandedProductId,
    source: result.status === 'FOUND_LOCAL' ? 'CURATED' : 'OPEN_FOOD_FACTS',
    servingUnits: result.servingUnits,
    caloriesPer100g: result.caloriesPer100g ?? 0,
    proteinPer100g: result.proteinPer100g ?? 0,
    carbsPer100g: result.carbsPer100g ?? 0,
    fatPer100g: result.fatPer100g ?? 0,
    fiberPer100g: result.fiberPer100g,
  };
}

export default function BarcodeResultScreen({ route, navigation }: Props) {
  const { barcode, date, mealType } = route.params;
  const { colors } = useThemeStore();
  const [state, setState] = useState<ScreenState>({ phase: 'loading' });
  const s = styles(colors);

  const doLookup = useCallback(async () => {
    setState({ phase: 'loading' });
    try {
      const result = await lookupBarcode(barcode);
      if (result.status === 'NOT_FOUND' || !result.foodItemId) {
        setState({ phase: 'not_found', barcode });
      } else {
        setState({ phase: 'found', result });
      }
    } catch (err: any) {
      setState({ phase: 'error', message: err?.message ?? 'Lookup failed', barcode });
    }
  }, [barcode]);

  useEffect(() => { doLookup(); }, [doLookup]);

  const handleLogFood = useCallback(() => {
    if (state.phase !== 'found') return;
    navigation.navigate('LogFood', {
      food: toFoodDetail(state.result),
      date,
      mealType,
    });
  }, [state, navigation, date, mealType]);

  const handleScanAgain = useCallback(() => {
    navigation.replace('BarcodeScanner', { date, mealType });
  }, [navigation, date, mealType]);

  const handleSearchManually = useCallback(() => {
    // Pop to tab root, then let Search tab open with context via navigate on Tabs
    navigation.popToTop();
    // Navigate to Tabs — Search tab will open contextually from the tab bar
    navigation.navigate('Tabs');
  }, [navigation]);

  return (
    <SafeAreaView style={s.root}>
      {/* Nav bar */}
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Barcode Result</Text>
        <View style={{ width: 60 }} />
      </View>

      {state.phase === 'loading' && (
        <View style={s.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={s.loadingText}>Looking up barcode…</Text>
        </View>
      )}

      {state.phase === 'found' && (
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <BarcodeResultCard result={state.result} />

          <TouchableOpacity style={s.logBtn} onPress={handleLogFood}>
            <Text style={s.logBtnText}>Log Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.secondaryBtn} onPress={handleScanAgain}>
            <Text style={s.secondaryBtnText}>Scan Another</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}

      {state.phase === 'not_found' && (
        <BarcodeNotFoundState
          barcode={state.barcode}
          onScanAgain={handleScanAgain}
          onSearchManually={handleSearchManually}
        />
      )}

      {state.phase === 'error' && (
        <View style={s.centered}>
          <Text style={s.errorIcon}>⚠️</Text>
          <Text style={s.errorTitle}>Lookup failed</Text>
          <Text style={s.errorBody}>{state.message}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={doLookup}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={s.secondaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    back: {
      fontSize: Typography.base,
      color: colors.primary,
      fontWeight: Typography.medium,
      width: 60,
    },
    navTitle: {
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'center',
    },
    content: { padding: Spacing.md },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    loadingText: {
      marginTop: Spacing.md,
      fontSize: Typography.base,
      color: colors.textSecondary,
    },
    logBtn: {
      marginTop: Spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md + 2,
      alignItems: 'center',
    },
    logBtnText: {
      color: colors.textInverse,
      fontSize: Typography.md,
      fontWeight: Typography.bold,
    },
    secondaryBtn: {
      marginTop: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: colors.textPrimary,
      fontSize: Typography.base,
    },
    errorIcon: { fontSize: 48, marginBottom: Spacing.md },
    errorTitle: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.sm,
    },
    errorBody: {
      fontSize: Typography.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
    },
    retryText: {
      color: colors.textInverse,
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
    },
  });
