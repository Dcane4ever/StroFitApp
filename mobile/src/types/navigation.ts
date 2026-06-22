import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { MealType } from './diary';
import { FoodDetail } from './food';
import { RecipeDetail } from './recipe';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Home: undefined;
  Search: {
    date: string;
    mealType: MealType;
  } | undefined;
  Progress: undefined;
  Profile: undefined;
};

// ─── Coaching Stack ───────────────────────────────────────────────────────────

export type CoachingStackParamList = {
  CoachDashboard: undefined;
  CoachInvite: undefined;
  TraineeSummary: { traineeId: string; traineeName: string };
  MyCoach: undefined;
};

// ─── Recipe Stack ─────────────────────────────────────────────────────────────

export type RecipeStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { recipeId: string };
  RecipeEditor: { recipeId?: string };
  RecipeIngredientPicker: { recipeId: string };
};

// ─── Planner Stack ────────────────────────────────────────────────────────────

export type PlannerStackParamList = {
  BudgetOverview: { date?: string };
  MealPlanDay: { date: string };
  MealPlanEditor: {
    planId: string;
    date: string;
    mealType: MealType;
  };
};

// ─── Main Stack (wraps tabs + pushes screens on top) ─────────────────────────

export type MainStackParamList = {
  Tabs: undefined;
  LogFood: {
    food: FoodDetail;
    date: string;
    mealType: MealType;
  };
  BarcodeScanner: {
    date: string;
    mealType: MealType;
  };
  BarcodeResult: {
    barcode: string;
    date: string;
    mealType: MealType;
  };
  LogRecipe: {
    recipe: RecipeDetail;
    date: string;
    mealType: MealType;
  };
  Recipes: undefined;
  Planner: { date?: string } | undefined;
  Coaching: { initialScreen?: 'CoachDashboard' | 'MyCoach' } | undefined;
};

// ─── Root Navigator ───────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ─── Screen props helpers ─────────────────────────────────────────────────────

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<MainStackParamList>
  >;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type RecipeStackScreenProps<T extends keyof RecipeStackParamList> =
  NativeStackScreenProps<RecipeStackParamList, T>;

export type PlannerStackScreenProps<T extends keyof PlannerStackParamList> =
  NativeStackScreenProps<PlannerStackParamList, T>;

export type CoachingStackScreenProps<T extends keyof CoachingStackParamList> =
  NativeStackScreenProps<CoachingStackParamList, T>;
