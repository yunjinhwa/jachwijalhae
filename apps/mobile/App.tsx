import React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  Onboarding: undefined;
  Setup: undefined;
  MainTabs: undefined;
};

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Shopping: undefined;
  Alerts: undefined;
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function ScreenLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

function OnboardingScreen({ navigation }: any) {
  return (
    <ScreenLayout title="자취잘해" description="생활물가 비교와 구매 판단">
      <View style={styles.featureBox}>
        <Text style={styles.feature}>✓ 지역 기반 평균가</Text>
        <Text style={styles.feature}>✓ 장보기 예상 합계</Text>
        <Text style={styles.feature}>✓ 목표가 가격 알림</Text>
      </View>

      <Button title="시작하기" onPress={() => navigation.navigate('Setup')} />
      <View style={styles.buttonGap} />
      <Button title="둘러보기" onPress={() => navigation.replace('MainTabs')} />
    </ScreenLayout>
  );
}

function SetupScreen({ navigation }: any) {
  return (
    <ScreenLayout title="초기 설정" description="거주 지역과 예산을 설정해 주세요.">
      <View style={styles.card}>
        <Text style={styles.label}>거주 지역</Text>
        <Text style={styles.placeholder}>예: 부산 사상구</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>월 장보기 예산</Text>
        <Text style={styles.placeholder}>예: 300,000원</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>관심 카테고리</Text>
        <Text style={styles.placeholder}>식품 · 축산물 · 생활용품</Text>
      </View>

      <Button title="설정 완료" onPress={() => navigation.replace('MainTabs')} />
    </ScreenLayout>
  );
}

function HomeScreen() {
  return (
    <ScreenLayout title="자취잘해" description="오늘 살 품목을 검색하세요">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>이번 주 물가 요약</Text>
        <Text>하락 12개 · 상승 7개 · 갱신 09:00</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>추천 구매 품목</Text>
        <Text>계란 30구 · 평균 6,200원</Text>
        <Text>쌀 10kg · 평균 28,900원</Text>
        <Text>우유 1L · 평균 2,450원</Text>
      </View>
    </ScreenLayout>
  );
}

function SearchScreen() {
  return (
    <ScreenLayout title="품목 검색" description="예: 계란, 라면, 세제">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <Text>계란</Text>
        <Text>라면</Text>
        <Text>즉석밥</Text>
        <Text>휴지</Text>
      </View>
    </ScreenLayout>
  );
}

function ShoppingScreen() {
  return (
    <ScreenLayout title="장보기 목록">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>예상 합계 34,600원</Text>
        <Text>☐ 계란 30구 · 6,200원</Text>
        <Text>☐ 즉석밥 12개 · 13,900원</Text>
        <Text>☐ 세탁세제 · 14,500원</Text>
      </View>
    </ScreenLayout>
  );
}

function AlertsScreen() {
  return (
    <ScreenLayout title="가격 알림">
      <View style={styles.card}>
        <Text>쌀 10kg · 27,000원 이하</Text>
        <Text>우유 1L · 2,300원 이하</Text>
        <Text>계란 30구 · 5,900원 이하</Text>
      </View>
    </ScreenLayout>
  );
}

function MyPageScreen() {
  return (
    <ScreenLayout title="마이페이지">
      <View style={styles.card}>
        <Text>지역 설정</Text>
        <Text>예산 설정</Text>
        <Text>알림 설정</Text>
        <Text>데이터 출처</Text>
      </View>
    </ScreenLayout>
  );
}

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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 24,
  },
  featureBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
  },
  feature: {
    fontSize: 15,
    color: '#111827',
  },
  buttonGap: {
    height: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    fontSize: 15,
    color: '#6B7280',
  },
});