import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/themeStore';
import { CoachingStackParamList, MainStackScreenProps } from '../types/navigation';
import CoachDashboardScreen from '../screens/coaching/CoachDashboardScreen';
import CoachInviteScreen from '../screens/coaching/CoachInviteScreen';
import TraineeSummaryScreen from '../screens/coaching/TraineeSummaryScreen';
import MyCoachScreen from '../screens/coaching/MyCoachScreen';

const Stack = createNativeStackNavigator<CoachingStackParamList>();

type Props = MainStackScreenProps<'Coaching'>;

export default function CoachingStack({ route }: Props) {
  const { colors } = useThemeStore();
  const initialScreen = route.params?.initialScreen ?? 'CoachDashboard';

  return (
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="CoachDashboard"
        component={CoachDashboardScreen}
        options={{ title: 'My Trainees' }}
      />
      <Stack.Screen
        name="CoachInvite"
        component={CoachInviteScreen}
        options={{ title: 'Invite Trainee' }}
      />
      <Stack.Screen
        name="TraineeSummary"
        component={TraineeSummaryScreen}
        options={({ route: r }) => ({ title: r.params.traineeName })}
      />
      <Stack.Screen
        name="MyCoach"
        component={MyCoachScreen}
        options={{ title: 'My Coach' }}
      />
    </Stack.Navigator>
  );
}
