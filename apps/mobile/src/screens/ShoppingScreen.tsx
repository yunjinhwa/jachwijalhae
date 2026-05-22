import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, EmptyState, Metric, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import type { ShoppingListItem } from '../types/domain';
import { formatWon } from '../utils/format';

export function ShoppingScreen({ navigation }: any) {
  const budget = usePreferenceStore((state) => state.budget);
  const listResource = useApiResource(() => jachwiApi.getShoppingList(), []);
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      listResource.reload();
    }, [listResource.reload]),
  );

  useEffect(() => {
    if (listResource.data?.items) {
      setItems(listResource.data.items);
    }
  }, [listResource.data?.items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.expectedPrice * item.quantity, 0),
    [items],
  );
  const checkedTotal = useMemo(
    () =>
      items
        .filter((item) => item.checked)
        .reduce((sum, item) => sum + item.expectedPrice * item.quantity, 0),
    [items],
  );

  const budgetPercent = Math.round((total / Math.max(budget, 1)) * 100);

  const toggleItem = async (id: string) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );

    try {
      const updatedItem = await jachwiApi.patchShoppingItem(id, { checked: !current.checked });
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    } catch (error) {
      setItems((prev) => prev.map((item) => (item.id === id ? current : item)));
      Alert.alert('장보기 저장 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
    }
  };

  const deleteItem = (id: string) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    Alert.alert('품목 삭제', `${current.name}을(를) 장보기 목록에서 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setItems((prev) => prev.filter((item) => item.id !== id));
          void jachwiApi.deleteShoppingItem(id).catch((error: unknown) => {
            setItems((prev) => [...prev, current]);
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
          });
        },
      },
    ]);
  };

  return (
    <ScreenLayout title="장보기 목록" eyebrow="GET /shopping-list" description="체크, 수정, 구매 완료까지 한 화면에서 처리합니다.">
      <View style={styles.metricRow}>
        <Metric label="예상 합계" value={formatWon(total)} />
        <Metric label="체크 금액" value={formatWon(checkedTotal)} tone="success" />
      </View>

      <Card>
        <SectionTitle title="예산 대비" action={listResource.loading ? '불러오는 중' : `${budgetPercent}%`} />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(budgetPercent, 100)}%` }]} />
        </View>
        <Text style={styles.muted}>월 예산 {formatWon(budget)} 중 {formatWon(total)} 예정</Text>
      </Card>

      {listResource.error ? (
        <EmptyState
          title="장보기 API 연결 실패"
          description={listResource.error}
          actionLabel="다시 불러오기"
          onPress={listResource.reload}
        />
      ) : null}

      <SectionTitle title="담은 품목" />
      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Pressable style={[styles.checkBox, item.checked && styles.checkBoxOn]} onPress={() => void toggleItem(item.id)}>
            <Text style={[styles.checkText, item.checked && styles.checkTextOn]}>{item.checked ? '✓' : ''}</Text>
          </Pressable>
          <View style={styles.itemMain}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.quantity}개 · 예상 {formatWon(item.expectedPrice)}</Text>
          </View>
          <View style={styles.rowActions}>
            <Pressable onPress={() => navigation.navigate('ShoppingEdit', { id: item.id })}>
              <Text style={styles.editText}>수정</Text>
            </Pressable>
            <Pressable onPress={() => deleteItem(item.id)}>
              <Text style={styles.deleteText}>삭제</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        <Button label="품목 추가" onPress={() => navigation.navigate('ShoppingEdit')} />
        <Button label="예산 요약" variant="secondary" onPress={() => navigation.navigate('ShoppingBudget')} />
        <Button label="구매 완료" variant="secondary" onPress={() => navigation.navigate('ShoppingComplete')} />
        <Button label="구매 이력" variant="text" onPress={() => navigation.navigate('PurchaseHistory')} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  itemRow: {
    minHeight: 72,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkBoxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: {
    color: colors.white,
    fontWeight: '900',
  },
  checkTextOn: {
    color: colors.white,
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  editText: {
    color: colors.info,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  deleteText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  rowActions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  actions: {
    gap: 10,
  },
});
