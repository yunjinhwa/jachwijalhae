import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card } from '../components/ui';
import { colors, typography } from '../theme/theme';

export function OnboardingScreen({ navigation }: any) {
  return (
    <ScreenLayout
      title="자취잘해"
      eyebrow="생활물가 구매 판단 앱"
      description="내 지역 생활물가를 보고, 지금 살지 기다릴지 빠르게 판단하세요."
    >
      <View style={styles.heroPanel}>
        <Text style={styles.heroNumber}>BUY</Text>
        <Text style={styles.heroText}>평균가보다 낮은 품목은 장보기 목록으로 바로 담습니다.</Text>
      </View>

      <Card>
        <Text style={styles.feature}>지역 기준 평균가와 판매처별 가격 비교</Text>
        <Text style={styles.feature}>BUY / WAIT / REPLACE 구매 판단</Text>
        <Text style={styles.feature}>예산, 장보기, 가격 알림까지 한 흐름으로 관리</Text>
      </Card>

      <View style={styles.actions}>
        <Button label="시작하기" onPress={() => navigation.navigate('Setup')} />
        <Button label="둘러보기" variant="secondary" onPress={() => navigation.replace('MainTabs')} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    minHeight: 180,
    borderRadius: 8,
    backgroundColor: colors.primary,
    padding: 20,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  heroNumber: {
    color: colors.white,
    fontSize: 46,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroText: {
    color: colors.white,
    fontSize: typography.body,
    lineHeight: 22,
  },
  feature: {
    color: colors.primary,
    fontSize: typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
  },
});
