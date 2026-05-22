import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

const ITEM_DETAIL_MAP: Record<
  string,
  {
    name: string;
    category: string;
    avgPrice: number;
    monthlyAvgPrice: number;
    changeRate7d: number;
    decision: 'BUY' | 'WAIT' | 'REPLACE' | 'NEUTRAL';
    decisionText: string;
    reason: string;
    source: string;
  }
> = {
  'egg-30': {
    name: '계란 30구',
    category: '축산물',
    avgPrice: 6200,
    monthlyAvgPrice: 6780,
    changeRate7d: -8.0,
    decision: 'BUY',
    decisionText: '사기 좋음',
    reason: '30일 평균보다 낮고 최근 7일 가격이 하락했어요.',
    source: 'KAMIS, 소비자원',
  },
  'egg-15': {
    name: '특란 15구',
    category: '축산물',
    avgPrice: 3300,
    monthlyAvgPrice: 3500,
    changeRate7d: -4.2,
    decision: 'BUY',
    decisionText: '사기 좋음',
    reason: '최근 평균가보다 낮은 편이에요.',
    source: 'KAMIS, 소비자원',
  },
  'rice-10': {
    name: '쌀 10kg',
    category: '식품',
    avgPrice: 28900,
    monthlyAvgPrice: 30100,
    changeRate7d: -2.1,
    decision: 'BUY',
    decisionText: '사기 좋음',
    reason: '최근 가격이 안정적이고 30일 평균보다 낮아요.',
    source: 'KAMIS',
  },
  'milk-1': {
    name: '우유 1L',
    category: '식품',
    avgPrice: 2450,
    monthlyAvgPrice: 2460,
    changeRate7d: 0.3,
    decision: 'NEUTRAL',
    decisionText: '평균 수준',
    reason: '최근 평균가와 거의 비슷해요.',
    source: '소비자원',
  },
  ramen: {
    name: '라면 5개입',
    category: '식품',
    avgPrice: 4200,
    monthlyAvgPrice: 4000,
    changeRate7d: 3.8,
    decision: 'WAIT',
    decisionText: '기다리기',
    reason: '최근 평균보다 높고 상승 흐름이에요.',
    source: '소비자원',
  },
  tissue: {
    name: '화장지 30롤',
    category: '생활용품',
    avgPrice: 15900,
    monthlyAvgPrice: 15100,
    changeRate7d: 4.5,
    decision: 'WAIT',
    decisionText: '기다리기',
    reason: '최근 가격이 오른 편이에요. 목표가 알림을 설정해보세요.',
    source: '소비자원',
  },
  tofu: {
    name: '두부 300g',
    category: '식품',
    avgPrice: 1300,
    monthlyAvgPrice: 1320,
    changeRate7d: -1.0,
    decision: 'NEUTRAL',
    decisionText: '평균 수준',
    reason: '가격이 평균 수준이에요.',
    source: '식품영양성분DB, 소비자원',
  },
  'green-onion': {
    name: '대파 1단',
    category: '농산물',
    avgPrice: 2800,
    monthlyAvgPrice: 3300,
    changeRate7d: -14.2,
    decision: 'BUY',
    decisionText: '사기 좋음',
    reason: '30일 평균보다 낮고 최근 가격 하락폭이 커요.',
    source: 'KAMIS',
  },
};

function getDecisionColor(decision: string) {
  if (decision === 'BUY') return colors.success;
  if (decision === 'WAIT') return colors.warning;
  if (decision === 'REPLACE') return colors.info;
  return colors.textMuted;
}

export function ItemDetailScreen({ route, navigation }: any) {
  const { itemId } = route.params;
  const item = ITEM_DETAIL_MAP[itemId] ?? ITEM_DETAIL_MAP['egg-30'];

  const diffFromMonthly = item.avgPrice - item.monthlyAvgPrice;
  const diffPercent = ((diffFromMonthly / item.monthlyAvgPrice) * 100).toFixed(1);

    return (
        <ScreenLayout title={item.name} description={`${item.category} · ${item.source}`}>
            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.priceCard}>
                <Text style={styles.label}>현재 평균가</Text>
                <Text style={styles.price}>{item.avgPrice.toLocaleString()}원</Text>

                <View style={styles.priceMetaRow}>
                <Text style={styles.metaText}>30일 평균 {item.monthlyAvgPrice.toLocaleString()}원</Text>
                <Text style={styles.metaText}>
                    {Number(diffPercent) > 0 ? '+' : ''}
                    {diffPercent}%
                </Text>
                </View>
            </View>

            <View style={styles.decisionCard}>
                <View style={styles.decisionHeader}>
                <Text style={styles.sectionTitle}>구매 판단</Text>
                <Text
                    style={[
                    styles.decisionBadge,
                    { backgroundColor: getDecisionColor(item.decision) },
                    ]}
                >
                    {item.decisionText}
                </Text>
                </View>

                <Text style={styles.reason}>{item.reason}</Text>
                <Text style={styles.modelText}>모델: 가격 편차 + 추세 + 대체품 비교</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>가격 정보</Text>

                <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>전주 대비</Text>
                <Text style={styles.infoValue}>
                    {item.changeRate7d > 0 ? '+' : ''}
                    {item.changeRate7d}%
                </Text>
                </View>

                <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>데이터 출처</Text>
                <Text style={styles.infoValue}>{item.source}</Text>
                </View>

                <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>마지막 갱신</Text>
                <Text style={styles.infoValue}>오늘 09:00</Text>
                </View>
            </View>

            <View style={styles.actionList}>
                <Pressable style={styles.actionItem}>
                <Text style={styles.actionText}>가격 추이 상세</Text>
                <Text style={styles.arrow}>›</Text>
                </Pressable>

                <Pressable style={styles.actionItem}>
                <Text style={styles.actionText}>판매처별 가격</Text>
                <Text style={styles.arrow}>›</Text>
                </Pressable>

                <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>장보기 목록에 추가</Text>
                </Pressable>
            </View>

            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>검색으로 돌아가기</Text>
            </Pressable>
            </ScrollView>
        </ScreenLayout>
        );
    }

const styles = StyleSheet.create({
  priceCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: colors.background,
    opacity: 0.8,
    marginBottom: 8,
  },
  price: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 12,
  },
  priceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    color: colors.background,
    opacity: 0.9,
  },
  decisionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
    gap: 10,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  decisionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  reason: {
    fontSize: 15,
    color: colors.primary,
    lineHeight: 22,
  },
  modelText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  actionList: {
    gap: 10,
    marginBottom: 12,
  },
  actionItem: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  arrow: {
    fontSize: 22,
    color: colors.textMuted,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});