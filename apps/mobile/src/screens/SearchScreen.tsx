import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function SearchScreen() {
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