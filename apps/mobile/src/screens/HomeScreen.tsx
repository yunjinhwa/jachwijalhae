import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function HomeScreen() {
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

const styles = StyleSheet.create({
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