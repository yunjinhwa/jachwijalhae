import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, DataNotice, EmptyState, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { colors, radius, typography } from '../theme/theme';
import type { PriceAlert } from '../types/domain';
import { formatWon } from '../utils/format';
import { navigateStack } from '../utils/navigation';

export function AlertsScreen({ navigation }: any) {
  const alertsResource = useApiResource(() => jachwiApi.getAlerts(), []);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useFocusEffect(
    useCallback(() => {
      alertsResource.reload();
    }, [alertsResource.reload]),
  );

  useEffect(() => {
    if (alertsResource.data?.alerts) {
      setAlerts(alertsResource.data.alerts);
    }
  }, [alertsResource.data?.alerts]);

  const toggleAlert = async (id: string) => {
    const current = alerts.find((alert) => alert.id === id);
    if (!current) return;

    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)),
    );

    try {
      const updatedAlert = await jachwiApi.patchAlert(id, { enabled: !current.enabled });
      setAlerts((prev) => prev.map((alert) => (alert.id === id ? updatedAlert : alert)));
    } catch (error) {
      setAlerts((prev) => prev.map((alert) => (alert.id === id ? current : alert)));
      Alert.alert('알림 저장 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
    }
  };

  return (
    <ScreenLayout title="가격 알림" eyebrow="GET /alerts" description="목표가 도달과 가격 급등락을 모아봅니다.">
      <Card>
        <SectionTitle
          title="알림 요약"
          action={alertsResource.loading ? '불러오는 중' : `${alerts.filter((item) => item.reached).length}개 도달`}
        />
        <Text style={styles.summaryText}>푸시 권한이 꺼져도 앱 내 알림 이력은 저장됩니다.</Text>
      </Card>

      {alertsResource.error ? (
        <EmptyState
          title="알림 API 연결 실패"
          description={alertsResource.error}
          actionLabel="다시 불러오기"
          onPress={alertsResource.reload}
        />
      ) : null}

      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alertRow}>
          <Pressable style={styles.alertMain} onPress={() => navigateStack(navigation, 'AlertEdit', { id: alert.id })}>
            <Text style={styles.alertTitle}>{alert.name}</Text>
            <Text style={styles.alertMeta}>목표가 {formatWon(alert.targetPrice)} 이하</Text>
            {alert.reached ? <Text style={styles.reached}>목표가 도달</Text> : null}
          </Pressable>
          <Pressable
            onPress={() => void toggleAlert(alert.id)}
            style={[styles.switch, alert.enabled && styles.switchOn]}
          >
            <View style={[styles.knob, alert.enabled && styles.knobOn]} />
          </Pressable>
        </View>
      ))}

      <View style={styles.actions}>
        <Button label="알림 만들기" onPress={() => navigateStack(navigation, 'AlertEdit')} />
        <Button label="알림 이력" variant="secondary" onPress={() => navigateStack(navigation, 'AlertHistory')} />
      </View>

      <DataNotice updatedAt="2026-05-21 09:00" source="가격 알림은 공공데이터 갱신 후 판단됩니다." />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  alertRow: {
    minHeight: 82,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  alertMain: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  alertMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  reached: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    padding: 3,
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  knobOn: {
    transform: [{ translateX: 20 }],
  },
  actions: {
    gap: 10,
  },
});
