import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';
import { usePreferenceStore } from '../store/usePreferenceStore';

const recommendations = [
  {
    id: 'egg',
    name: '계란 30구',
    price: 6200,
    decision: '사기 좋음',
    reason: '30일 평균보다 8% 낮아요',
  },
  {
    id: 'rice',
    name: '쌀 10kg',
    price: 28900,
    decision: '사기 좋음',
    reason: '최근 가격이 안정적이에요',
  },
  {
    id: 'milk',
    name: '우유 1L',
    price: 2450,
    decision: '평균 수준',
    reason: '최근 평균가와 비슷해요',
  },
];

export function HomeScreen() {
  const region = usePreferenceStore((state) => state.region);
  const budget = usePreferenceStore((state) => state.budget);
  const categories = usePreferenceStore((state) => state.categories);

  return (
    <ScreenLayout title="자취잘해" description={`${region || '지역 미설정'} 기준 생활물가`}>
      <Pressable style={styles.searchBox}>
        <Text style={styles.searchText}>⌕ 오늘 살 품목을 검색하세요</Text>
      </Pressable>

      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>내 장보기 설정</Text>
        <Text style={styles.profileText}>
          월 예산 {budget > 0 ? `${budget.toLocaleString()}원` : '미설정'}
        </Text>
        <Text style={styles.profileText}>
          관심 카테고리 {categories.length > 0 ? categories.join(', ') : '미설정'}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>이번 주 물가 요약</Text>
          <Text style={styles.updatedAt}>갱신 09:00</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>12개</Text>
            <Text style={styles.summaryLabel}>하락</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>7개</Text>
            <Text style={styles.summaryLabel}>상승</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>21개</Text>
            <Text style={styles.summaryLabel}>안정</Text>
          </View>
        </View>
      </View>

      <View style={styles.decisionRow}>
        <View style={styles.decisionCard}>
          <Text style={styles.decisionTitle}>사기 좋은 품목</Text>
          <Text style={styles.decisionBody}>계란, 쌀, 대파</Text>
        </View>

        <View style={styles.decisionCard}>
          <Text style={styles.decisionTitle}>기다릴 품목</Text>
          <Text style={styles.decisionBody}>세제, 참치캔</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>추천 구매 품목</Text>

        {recommendations.map((item) => (
          <View key={item.id} style={styles.recommendItem}>
            <View style={styles.recommendMain}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemReason}>{item.reason}</Text>
            </View>

            <View style={styles.recommendSide}>
              <Text style={styles.itemPrice}>{item.price.toLocaleString()}원</Text>
              <Text style={styles.badge}>{item.decision}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sourceText}>
        가격 정보는 공공데이터 갱신 시점과 실제 판매가가 다를 수 있어요.
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  profileCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginBottom: 16,
    gap: 6,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 2,
  },
  profileText: {
    fontSize: 14,
    color: colors.background,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  updatedAt: {
    fontSize: 12,
    color: colors.textMuted,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingVertical: 14,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  decisionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  decisionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  decisionBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 12,
    gap: 12,
  },
  recommendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  recommendMain: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  itemReason: {
    fontSize: 12,
    color: colors.textMuted,
  },
  recommendSide: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  badge: {
    fontSize: 11,
    color: colors.background,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  sourceText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 24,
  },
});