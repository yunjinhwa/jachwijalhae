import React from 'react';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, DataNotice, DecisionBadge, EmptyState, InfoRow } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { formatWon } from '../utils/format';

export function ItemDetailScreen({ route, navigation }: any) {
  const itemId = route.params?.itemId ?? 'item_rice_10';
  const itemResource = useApiResource(() => jachwiApi.getItemDetail(itemId), [itemId]);
  const item = itemResource.data;

  return (
    <ScreenLayout
      title={item?.name ?? '품목 상세'}
      eyebrow="GET /items/{id}/detail"
      description={item ? `${item.categoryName} · ${item.unit}` : '서버에서 품목 정보를 불러옵니다.'}
    >
      {itemResource.error ? (
        <EmptyState
          title="품목 API 연결 실패"
          description={itemResource.error}
          actionLabel="다시 불러오기"
          onPress={itemResource.reload}
        />
      ) : null}

      {item ? (
        <>
          <Card>
            <DecisionBadge decision={item.decision} />
            <InfoRow label="현재 평균가" value={formatWon(item.avgPrice)} />
            <InfoRow label="30일 평균가" value={formatWon(item.monthlyAvgPrice)} />
            <InfoRow label="7일 변동률" value={`${item.changeRate7d > 0 ? '+' : ''}${item.changeRate7d}%`} />
          </Card>
          <Button label="구매 판단 보기" onPress={() => navigation.navigate('ItemDecision', { itemId: item.id })} />
          <Button label="가격 추이 보기" variant="secondary" onPress={() => navigation.navigate('PriceTrend', { itemId: item.id })} />
          <DataNotice updatedAt={item.updatedAt} source={item.source} requiresApiKey />
        </>
      ) : null}
    </ScreenLayout>
  );
}
