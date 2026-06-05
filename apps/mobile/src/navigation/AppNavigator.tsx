import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/theme';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { screenSpecs } from '../data/screenSpecs';
import { AlertsScreen } from '../screens/AlertsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyPageScreen } from '../screens/MyPageScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { ShoppingScreen } from '../screens/ShoppingScreen';
import { SpecScreen } from '../screens/SpecScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const tabMeta = {
  HomeTab: { title: '홈', mark: 'H' },
  SearchTab: { title: '검색', mark: 'S' },
  ShoppingTab: { title: '목록', mark: 'L' },
  AlertsTab: { title: '알림', mark: 'A' },
  MyPageTab: { title: 'MY', mark: 'M' },
};

function TabMark({ mark, color }: { mark: string; color: string }) {
  return <Text style={{ color, fontSize: 11, fontWeight: '900' }}>{mark}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const meta = tabMeta[route.name];

        return {
          headerShown: false,
          title: meta.title,
          tabBarIcon: ({ color }) => <TabMark mark={meta.mark} color={color} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '800',
          },
          tabBarStyle: {
            minHeight: 64,
            paddingTop: 6,
            paddingBottom: 8,
            borderTopColor: colors.border,
          },
        };
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="ShoppingTab" component={ShoppingScreen} />
      <Tab.Screen name="AlertsTab" component={AlertsScreen} />
      <Tab.Screen name="MyPageTab" component={MyPageScreen} />
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
        {screenSpecs.map((spec) => (
          <Stack.Screen key={spec.routeName} name={spec.routeName as keyof RootStackParamList}>
            {(props) => <SpecScreen {...props} spec={spec} />}
          </Stack.Screen>
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
