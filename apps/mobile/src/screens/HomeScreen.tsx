import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';
import { usePreferenceStore } from '../store/usePreferenceStore';

export function HomeScreen() {
  const region = usePreferenceStore((state) => state.region);
  const budget = usePreferenceStore((state) => state.budget);
  const categories = usePreferenceStore((state) => state.categories);

  return (
    <ScreenLayout title="자취잘해" description="오늘 살 품목을 검색하세요">
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>내 설정</Text>
        <Text style={styles.profileText}>지역: {region || '미설정'}</Text>
        <Text style={styles.profileText}>
          월 예산: {budget > 0 ? `${budget.toLocaleString()}원` : '미설정'}
        </Text>
        <Text style={styles.profileText}>
          관심 카테고리: {categories.length > 0 ? categories.join(', ') : '미설정'}
        </Text>
      </View>

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

const styles = StyleSheet.create({
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
    marginBottom: 4,
  },
  profileText: {
    fontSize: 14,
    color: colors.background,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
});