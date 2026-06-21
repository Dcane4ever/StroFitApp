import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { token, isLoading, restoreAuth } = useAuthStore();
  const { colors, restoreTheme } = useThemeStore();

  useEffect(() => {
    Promise.all([restoreAuth(), restoreTheme()]);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {token ? (
        <Root.Screen name="Main" component={MainTabs} />
      ) : (
        <Root.Screen name="Auth" component={AuthStack} />
      )}
    </Root.Navigator>
  );
}
