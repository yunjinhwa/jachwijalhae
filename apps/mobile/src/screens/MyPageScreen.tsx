import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, DataNotice, InfoRow, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import { formatWon } from '../utils/format';
import { navigateStack } from '../utils/navigation';

const MENU = [
  { label: '지역/예산 설정', route: 'Setup' },
  { label: '구매 이력', route: 'PurchaseHistory' },
  { label: '알림 이력', route: 'AlertHistory' },
  { label: '앱 설정', route: 'Settings' },
];

export function MyPageScreen({ navigation }: any) {
  const storeRegion = usePreferenceStore((state) => state.region);
  const storeBudget = usePreferenceStore((state) => state.budget);
  const storeBudgetPeriod = usePreferenceStore((state) => state.budgetPeriod);
  const storeCategories = usePreferenceStore((state) => state.categories);
  const storeKeywords = usePreferenceStore((state) => state.keywords);
  const resetPreferences = usePreferenceStore((state) => state.resetPreferences);
  const userResource = useApiResource(() => jachwiApi.getUserMe(), []);
  const dataSourcesResource = useApiResource(() => jachwiApi.getDataSources(), []);
  const preferences = userResource.data?.preferences;
  const region = preferences?.region ?? storeRegion;
  const budget = preferences?.budget ?? storeBudget;
  const budgetPeriod = preferences?.budgetPeriod ?? storeBudgetPeriod;
  const categories = preferences?.categories ?? storeCategories;
  const keywords = preferences?.keywords ?? storeKeywords;
  const budgetPeriodLabel = budgetPeriod === 'weekly' ? '주간' : '월간';
  const sourceNames =
    dataSourcesResource.data?.apiSources.map((source) => source.name).join(', ') ??
    'KAMIS, 한국소비자원, 식품영양성분DB';

  const handleLogout = () => {
    Alert.alert('로그아웃', '저장된 설정을 초기화하고 처음 화면으로 돌아갈까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          resetPreferences();
          const parent = navigation.getParent?.();
          parent?.reset?.({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        },
      },
    ]);
  };

  return (
    <ScreenLayout title="마이페이지" eyebrow="GET /users/me" description="익명 사용자도 장보기와 알림을 저장할 수 있습니다.">
      <Card>
        <SectionTitle title="내 정보" action={userResource.loading ? '불러오는 중' : undefined} />
        <InfoRow label="기준 지역" value={region} />
        <InfoRow label={`${budgetPeriodLabel} 예산`} value={formatWon(budget)} />
        <InfoRow label="관심 카테고리" value={categories.length > 0 ? categories.join(', ') : '없음'} />
        <InfoRow label="관심 키워드" value={keywords.length > 0 ? keywords.join(', ') : '없음'} />
        {userResource.error ? <Text style={styles.sourceStatusRequired}>{userResource.error}</Text> : null}
      </Card>

      <View style={styles.menuList}>
        {MENU.map((item) => (
          <Pressable key={item.route} style={styles.menuRow} onPress={() => navigateStack(navigation, item.route)}>
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <SectionTitle title="데이터 원천" action={dataSourcesResource.loading ? '확인 중' : `${dataSourcesResource.data?.apiSources.length ?? 3}곳`} />
        <Text style={styles.sourceText}>{sourceNames}</Text>
        <Text style={styles.sourceText}>가격 판단은 현재가, 최근 평균가, 최저가, 변동률을 함께 봅니다.</Text>
      </Card>

      <Button label="로그아웃" variant="secondary" onPress={handleLogout} />
      <DataNotice source="KAMIS·한국소비자원·식품영양성분DB" />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  menuList: {
    marginBottom: 16,
    gap: 10,
  },
  menuRow: {
    minHeight: 54,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 24,
  },
  sourceStatusRequired: {
    color: colors.danger,
  },
  sourceText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 19,
  },
});
