import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function ShoppingScreen() {
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