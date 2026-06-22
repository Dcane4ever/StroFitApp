import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import MainTabs from './MainTabs';
import LogFoodScreen from '../screens/main/LogFoodScreen';
import BarcodeScannerScreen from '../screens/main/BarcodeScannerScreen';
import BarcodeResultScreen from '../screens/main/BarcodeResultScreen';
import LogRecipeScreen from '../screens/main/LogRecipeScreen';
import RecipeStack from './RecipeStack';
import PlannerStack from './PlannerStack';
import CoachingStack from './CoachingStack';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  const { colors } = useThemeStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen
        name="LogFood"
        component={LogFoodScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="BarcodeResult"
        component={BarcodeResultScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="LogRecipe"
        component={LogRecipeScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Recipes"
        component={RecipeStack}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Planner"
        component={PlannerStack}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Coaching"
        component={CoachingStack}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
