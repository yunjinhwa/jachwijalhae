import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

export function AlertsScreen() {
  return (
    <ScreenLayout title="가격 알림">
      <View style={styles.card}>
        <Text>쌀 10kg · 27,000원 이하</Text>
        <Text>우유 1L · 2,300원 이하</Text>
        <Text>계란 30구 · 5,900원 이하</Text>
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