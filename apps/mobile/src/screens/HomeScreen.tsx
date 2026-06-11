import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, DataNotice, Metric, PriceRow, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import { formatWon } from '../utils/format';
import { navigateStack } from '../utils/navigation';

export function HomeScreen({ navigation }: any) {
  const region = usePreferenceStore((state) => state.region);
  const budget = usePreferenceStore((state) => state.budget);
  const budgetPeriod = usePreferenceStore((state) => state.budgetPeriod);
  const categories = usePreferenceStore((state) => state.categories);
  const home = useApiResource(() => jachwiApi.getHomeSummary(), []);
  const waitRecommendations = useApiResource(() => jachwiApi.getRecommendations('WAIT'), []);
  const summary = home.data?.summary ?? { downCount: 0, upCount: 0, stableCount: 0 };
  const buyItems = home.data?.recommendations ?? [];
  const waitItems = waitRecommendations.data?.itemList ?? [];
  const unreadAlerts = home.data?.alerts.unreadCount ?? 0;
  const budgetPeriodLabel = budgetPeriod === 'weekly' ? '주간' : '월간';

  return (
    <ScreenLayout
      title="자취잘해"
      eyebrow="GET /home/summary"
      description={`${region} 기준 생활물가 요약`}
    >
      <Pressable style={styles.searchBox} onPress={() => navigation.navigate('SearchTab')}>
        <Text style={styles.searchText}>계란, 라면, 세제 검색</Text>
        <Text style={styles.searchAction}>검색</Text>
      </Pressable>

      {home.error ? (
        <Card>
          <SectionTitle title="서버 연결 실패" />
          <Text style={styles.muted}>{home.error}</Text>
          <Button label="다시 불러오기" variant="secondary" onPress={home.reload} />
        </Card>
      ) : null}

      <Card>
        <SectionTitle title="내 장보기 기준" action={`${unreadAlerts}개 알림`} />
        <View style={styles.profileGrid}>
          <Metric label={`${budgetPeriodLabel} 예산`} value={formatWon(budget)} />
          <Metric label="관심 카테고리" value={`${categories.length}개`} />
        </View>
        <Text style={styles.muted}>{categories.join(', ')}</Text>
      </Card>

      <View style={styles.metricRow}>
        <Metric label="하락" value={home.loading ? '-' : `${summary.downCount}개`} tone="success" />
        <Metric label="상승" value={home.loading ? '-' : `${summary.upCount}개`} tone="danger" />
        <Metric label="안정" value={home.loading ? '-' : `${summary.stableCount}개`} tone="info" />
      </View>

      <Card>
        <SectionTitle title="바로 확인" action="가격 흐름" />
        <Pressable style={styles.menuRow} onPress={() => navigateStack(navigation, 'PriceSummary')}>
          <View style={styles.menuMain}>
            <Text style={styles.menuTitle}>물가 요약</Text>
            <Text style={styles.menuBody}>주간/월간 상승·하락 품목</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuRow} onPress={() => navigateStack(navigation, 'Recommendations')}>
          <View style={styles.menuMain}>
            <Text style={styles.menuTitle}>추천 구매</Text>
            <Text style={styles.menuBody}>사기 좋은 품목과 기다릴 품목</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={[styles.menuRow, styles.menuRowLast]} onPress={() => navigateStack(navigation, 'RecentItems')}>
          <View style={styles.menuMain}>
            <Text style={styles.menuTitle}>최근 본 품목</Text>
            <Text style={styles.menuBody}>다시 확인하기</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      </Card>

      <SectionTitle title="지금 사기 좋은 품목" action="추천 기준" />
      {buyItems.map((item) => (
        <PriceRow
          key={item.id}
          name={item.name}
          meta={item.reason}
          price={item.avgPrice}
          changeRate={item.changeRate7d}
          decision={item.decision}
          onPress={() => navigateStack(navigation, 'ItemDetail', { itemId: item.id })}
        />
      ))}

      <SectionTitle title="기다리면 좋은 품목" />
      {waitItems.map((item) => (
        <PriceRow
          key={item.id}
          name={item.name}
          meta={item.reason}
          price={item.avgPrice}
          changeRate={item.changeRate7d}
          decision={item.decision}
          onPress={() => navigateStack(navigation, 'ItemDecision', { itemId: item.id })}
        />
      ))}

      <DataNotice updatedAt="2026-05-21 09:00" source="한국소비자원/KAMIS" />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 48,
    borderRadius: radius.control,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchText: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  searchAction: {
    color: colors.info,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  profileGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  menuRow: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuMain: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  menuBody: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 24,
  },
});
