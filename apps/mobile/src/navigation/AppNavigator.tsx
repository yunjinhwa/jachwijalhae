import React from 'react';
import { Text, View } from 'react-native';
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
  HomeTab: { title: '홈', mark: '홈', testID: 'tab-home' },
  SearchTab: { title: '검색', mark: '찾', testID: 'tab-search' },
  ShoppingTab: { title: '장보기', mark: '장', testID: 'tab-shopping' },
  AlertsTab: { title: '알림', mark: '알', testID: 'tab-alerts' },
  MyPageTab: { title: 'MY', mark: '나', testID: 'tab-mypage' },
};

function TabMark({ mark, color, focused }: { mark: string; color: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.infoSoft : colors.surface,
        borderWidth: 1,
        borderColor: focused ? colors.info : colors.border,
      }}
    >
      <Text style={{ color, fontSize: 14, fontWeight: '900' }}>{mark}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const meta = tabMeta[route.name];

        return {
          headerShown: false,
          title: meta.title,
          tabBarButtonTestID: meta.testID,
          tabBarIcon: ({ color, focused }) => <TabMark mark={meta.mark} color={color} focused={focused} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '800',
            marginTop: 2,
          },
          tabBarStyle: {
            alignSelf: 'center',
            width: '100%',
            maxWidth: 760,
            minHeight: 78,
            paddingTop: 8,
            paddingBottom: 12,
            paddingHorizontal: 10,
            backgroundColor: colors.white,
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
