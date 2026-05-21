import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function MyPageScreen() {
  return (
    <ScreenLayout title="마이페이지">
      <View style={styles.card}>
        <Text>지역 설정</Text>
        <Text>예산 설정</Text>
        <Text>알림 설정</Text>
        <Text>데이터 출처</Text>
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
});