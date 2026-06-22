import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/themeStore';
import { PlannerStackParamList } from '../types/navigation';
import BudgetOverviewScreen from '../screens/planner/BudgetOverviewScreen';
import MealPlanDayScreen from '../screens/planner/MealPlanDayScreen';
import MealPlanEditorScreen from '../screens/planner/MealPlanEditorScreen';

const Stack = createNativeStackNavigator<PlannerStackParamList>();

export default function PlannerStack() {
  const { colors } = useThemeStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="BudgetOverview"
        component={BudgetOverviewScreen}
        options={{ title: 'Planner & Budget' }}
      />
      <Stack.Screen
        name="MealPlanDay"
        component={MealPlanDayScreen}
        options={{ title: 'Meal Plan' }}
      />
      <Stack.Screen
        name="MealPlanEditor"
        component={MealPlanEditorScreen}
        options={{ title: 'Add Food to Plan' }}
      />
    </Stack.Navigator>
  );
}
