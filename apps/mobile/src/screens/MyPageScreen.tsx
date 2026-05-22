import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Card, DataNotice, InfoRow, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import { formatWon } from '../utils/format';

const MENU = [
  { label: '지역/예산 설정', route: 'Setup' },
  { label: '구매 이력', route: 'PurchaseHistory' },
  { label: '알림 이력', route: 'AlertHistory' },
  { label: '앱 설정', route: 'Settings' },
];

export function MyPageScreen({ navigation }: any) {
  const storeRegion = usePreferenceStore((state) => state.region);
  const storeBudget = usePreferenceStore((state) => state.budget);
  const storeCategories = usePreferenceStore((state) => state.categories);
  const userResource = useApiResource(() => jachwiApi.getUserMe(), []);
  const preferences = userResource.data?.preferences;
  const region = preferences?.region ?? storeRegion;
  const budget = preferences?.budget ?? storeBudget;
  const categories = preferences?.categories ?? storeCategories;
  const authState = userResource.data?.profile.authState ?? 'GUEST_SYNC';

  return (
    <ScreenLayout title="마이페이지" eyebrow="GET /users/me" description="익명 사용자도 장보기와 알림을 저장할 수 있습니다.">
      <Card>
        <SectionTitle title="내 정보" action={userResource.loading ? '불러오는 중' : authState} />
        <InfoRow label="기준 지역" value={region} />
        <InfoRow label="월 예산" value={formatWon(budget)} />
        <InfoRow label="관심 카테고리" value={categories.join(', ')} />
        {userResource.error ? <Text style={styles.sourceStatusRequired}>{userResource.error}</Text> : null}
      </Card>

      <View style={styles.menuList}>
        {MENU.map((item) => (
          <Pressable key={item.route} style={styles.menuRow} onPress={() => navigation.navigate(item.route)}>
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        ))}
      </View>

      <DataNotice source="정확한 주소나 실시간 위치는 MVP 범위에서 수집하지 않습니다." />
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
});
