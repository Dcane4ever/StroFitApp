import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecipeStackParamList } from '../types/navigation';
import { useThemeStore } from '../store/themeStore';
import RecipeListScreen from '../screens/recipe/RecipeListScreen';
import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import RecipeEditorScreen from '../screens/recipe/RecipeEditorScreen';
import RecipeIngredientPickerScreen from '../screens/recipe/RecipeIngredientPickerScreen';

const Stack = createNativeStackNavigator<RecipeStackParamList>();

export default function RecipeStack() {
  const { colors } = useThemeStore();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="RecipeList" component={RecipeListScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="RecipeEditor" component={RecipeEditorScreen} />
      <Stack.Screen name="RecipeIngredientPicker" component={RecipeIngredientPickerScreen} />
    </Stack.Navigator>
  );
}
