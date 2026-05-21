import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function OnboardingScreen({ navigation }: any) {
  return (
    <ScreenLayout title="자취잘해" description="생활물가 비교와 구매 판단">
      <View style={styles.featureBox}>
        <Text style={styles.feature}>✓ 지역 기반 평균가</Text>
        <Text style={styles.feature}>✓ 장보기 예상 합계</Text>
        <Text style={styles.feature}>✓ 목표가 가격 알림</Text>
      </View>

      <Button title="시작하기" onPress={() => navigation.navigate('Setup')} />
      <View style={styles.buttonGap} />
      <Button title="둘러보기" onPress={() => navigation.replace('MainTabs')} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  featureBox: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
  },
  feature: {
    fontSize: 15,
    color: colors.primary,
  },
  buttonGap: {
    height: 12,
  },
});