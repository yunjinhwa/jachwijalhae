import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function SetupScreen({ navigation }: any) {
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

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  placeholder: {
    fontSize: 15,
    color: colors.textMuted,
  },
});