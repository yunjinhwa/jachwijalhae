import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ShoppingScreen } from '../screens/ShoppingScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { MyPageScreen } from '../screens/MyPageScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Setup: undefined;
  MainTabs: undefined;
  ItemDetail: { itemId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Shopping: undefined;
  Alerts: undefined;
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: '검색' }} />
      <Tab.Screen name="Shopping" component={ShoppingScreen} options={{ title: '목록' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: '알림' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: 'MY' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}