import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  Button,
  Card,
  Chip,
  DataNotice,
  DecisionBadge,
  EmptyState,
  InfoRow,
  Metric,
  MiniChart,
  PriceRow,
  SectionTitle,
} from '../components/ui';
import {
  alertHistory,
  alternativeItems,
  categories,
  getItem,
  getItemsByCategory,
  priceItems,
  purchaseHistory,
  shoppingItems,
} from '../data/mockData';
import { ScreenSpec } from '../data/screenSpecs';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import { Decision, PriceAlert, PriceItem } from '../types/domain';
import { formatWon } from '../utils/format';

type SpecScreenProps = {
  navigation: any;
  route: any;
  spec: ScreenSpec;
};

type DecisionFilter = Decision | 'ALL';
type ShoppingEditSeed = ReturnType<typeof getItem>;

const periodOptions = ['7일', '30일', '90일'];
const sortOptions = ['인기순', '낮은 가격순', '변동률순'];
const itemBackedKinds = new Set([
  'itemDetail',
  'itemBasic',
  'itemPrices',
  'priceTrend',
  'sellerPrices',
  'itemDecision',
  'alternatives',
  'compareRegions',
  'compareStores',
  'shoppingEdit',
  'alertEdit',
]);
const categoryBackedKinds = new Set(['categories', 'categoryItems', 'filter']);
const recommendationBackedKinds = new Set(['recommendations', 'buyDecision', 'waitDecision']);

function routeString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function routeStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : undefined;
}

function toTrendPeriod(period: string) {
  if (period === '30일') return '30d';
  if (period === '90일') return '90d';
  return '7d';
}

function toChangePeriod(period: string) {
  return period === '30일' ? 'monthly' : 'weekly';
}

function searchLocalItems(query?: string) {
  const normalized = query?.trim().toLowerCase() ?? '';

  if (!normalized) {
    return priceItems;
  }

  return priceItems.filter(
    (entry) =>
      entry.name.toLowerCase().includes(normalized) ||
      entry.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)),
  );
}

export function SpecScreen({ navigation, route, spec }: SpecScreenProps) {
  const params = route.params ?? {};
  const routeItemId = routeString(params.itemId);
  const routeId = routeString(params.id);
  const selectedItemId = routeItemId ?? (routeId?.startsWith('item_') ? routeId : undefined);
  const routeCategoryId = routeString(params.categoryId);
  const routeKeyword = routeString(params.keyword);
  const routeCompareIds = routeStringList(params.ids);
  const region = usePreferenceStore((state) => state.region);
  const budget = usePreferenceStore((state) => state.budget);
  const [period, setPeriod] = useState(periodOptions[0]);
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>('ALL');
  const [allAlertHistoryRead, setAllAlertHistoryRead] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([
    ...(routeCompareIds?.slice(0, 2) ?? [priceItems[0].id, priceItems[1].id]),
  ]);

  const fallbackItem = getItem(selectedItemId);
  const activeItemId = selectedItemId ?? fallbackItem.id;
  const fallbackCategoryId = routeCategoryId ?? fallbackItem.categoryId;
  const shouldLoadItem = itemBackedKinds.has(spec.kind);
  const shouldLoadCategories = categoryBackedKinds.has(spec.kind);
  const recommendationType =
    spec.kind === 'buyDecision'
      ? 'BUY'
      : spec.kind === 'waitDecision'
        ? 'WAIT'
        : decisionFilter === 'ALL'
          ? undefined
          : decisionFilter;

  const priceSummaryResource = useApiResource(() =>
    spec.kind === 'priceSummary' ? jachwiApi.getPriceSummary() : Promise.resolve(null),
    [spec.kind],
  );
  const priceChangesResource = useApiResource(() =>
    spec.kind === 'priceChanges' ? jachwiApi.getPriceChanges(toChangePeriod(period)) : Promise.resolve(null),
    [spec.kind, period],
  );
  const categoriesResource = useApiResource(() =>
    shouldLoadCategories ? jachwiApi.getCategories() : Promise.resolve(null),
    [shouldLoadCategories],
  );
  const categoryItemsResource = useApiResource(() =>
    spec.kind === 'categoryItems' ? jachwiApi.getCategoryItems(fallbackCategoryId) : Promise.resolve(null),
    [spec.kind, fallbackCategoryId],
  );
  const searchResource = useApiResource(() =>
    spec.kind === 'searchResults' || spec.kind === 'compareSelect'
      ? jachwiApi.searchItems({ q: routeKeyword })
      : Promise.resolve(null),
    [spec.kind, routeKeyword],
  );
  const itemDetailResource = useApiResource(() =>
    shouldLoadItem ? jachwiApi.getItemDetail(activeItemId) : Promise.resolve(null),
    [shouldLoadItem, activeItemId],
  );
  const itemBasicResource = useApiResource(() =>
    spec.kind === 'itemBasic' ? jachwiApi.getItemBasic(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const itemPricesResource = useApiResource(() =>
    spec.kind === 'itemPrices' ? jachwiApi.getItemPrices(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const itemTrendResource = useApiResource(() =>
    spec.kind === 'priceTrend' ? jachwiApi.getItemTrend(activeItemId, toTrendPeriod(period)) : Promise.resolve(null),
    [spec.kind, activeItemId, period],
  );
  const itemSellersResource = useApiResource(() =>
    spec.kind === 'sellerPrices' ? jachwiApi.getItemSellers(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const itemDecisionResource = useApiResource(() =>
    spec.kind === 'itemDecision' ? jachwiApi.getItemDecision(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const alternativesResource = useApiResource(() =>
    spec.kind === 'alternatives' ? jachwiApi.getAlternatives(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const recommendationsResource = useApiResource(() =>
    recommendationBackedKinds.has(spec.kind) ? jachwiApi.getRecommendations(recommendationType) : Promise.resolve(null),
    [spec.kind, recommendationType],
  );
  const compareResultResource = useApiResource(() =>
    spec.kind === 'compareResult' ? jachwiApi.getCompareItems(selectedCompareIds) : Promise.resolve(null),
    [spec.kind, selectedCompareIds.join(',')],
  );
  const compareRegionsResource = useApiResource(() =>
    spec.kind === 'compareRegions' ? jachwiApi.getCompareRegions(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const compareStoresResource = useApiResource(() =>
    spec.kind === 'compareStores' ? jachwiApi.getCompareStores(activeItemId) : Promise.resolve(null),
    [spec.kind, activeItemId],
  );
  const shoppingBudgetResource = useApiResource(() =>
    spec.kind === 'shoppingBudget' ? jachwiApi.getShoppingBudget() : Promise.resolve(null),
    [spec.kind],
  );
  const shoppingListResource = useApiResource(() =>
    spec.kind === 'shoppingComplete' ? jachwiApi.getShoppingList() : Promise.resolve(null),
    [spec.kind],
  );
  const purchaseHistoryResource = useApiResource(() =>
    spec.kind === 'purchaseHistory' ? jachwiApi.getPurchaseHistory('2026-05') : Promise.resolve(null),
    [spec.kind],
  );
  const alertHistoryResource = useApiResource(() =>
    spec.kind === 'alertHistory' ? jachwiApi.getAlertHistory() : Promise.resolve(null),
    [spec.kind],
  );

  const item = itemDetailResource.data ?? fallbackItem;
  const liveCategories = categoriesResource.data?.categories ?? categories;
  const categoryId = routeCategoryId ?? item.categoryId;
  const category = liveCategories.find((entry) => entry.id === categoryId) ?? liveCategories[0] ?? categories[0];
  const categoryItems = categoryItemsResource.data?.items ?? getItemsByCategory(categoryId);
  const selectedCompareItems = compareResultResource.data?.items ?? selectedCompareIds.map((id) => getItem(id));
  const searchItems = searchResource.data?.items ?? searchLocalItems(routeKeyword);
  const resourceError =
    priceSummaryResource.error ??
    priceChangesResource.error ??
    categoriesResource.error ??
    categoryItemsResource.error ??
    searchResource.error ??
    itemDetailResource.error ??
    itemBasicResource.error ??
    itemPricesResource.error ??
    itemTrendResource.error ??
    itemSellersResource.error ??
    itemDecisionResource.error ??
    alternativesResource.error ??
    recommendationsResource.error ??
    compareResultResource.error ??
    compareRegionsResource.error ??
    compareStoresResource.error ??
    shoppingBudgetResource.error ??
    shoppingListResource.error ??
    purchaseHistoryResource.error ??
    alertHistoryResource.error;

  const recommendations = useMemo(() => {
    if (recommendationsResource.data?.itemList) {
      return recommendationsResource.data.itemList;
    }

    if (decisionFilter === 'ALL') {
      return priceItems;
    }

    return priceItems.filter((entry) => entry.decision === decisionFilter);
  }, [decisionFilter, recommendationsResource.data]);

  const renderContent = () => {
    switch (spec.kind) {
      case 'priceSummary': {
        const downTop =
          priceSummaryResource.data?.downTop ??
          priceItems
            .filter((entry) => entry.changeRate7d < 0)
            .slice(0, 4);
        const upTop =
          priceSummaryResource.data?.upTop ??
          priceItems
            .filter((entry) => entry.changeRate7d > 0)
            .slice(0, 3);

        return (
          <>
            <ChipRow options={['주간', '월간']} selected={period === '7일' ? '주간' : '월간'} onSelect={(value) => setPeriod(value === '주간' ? '7일' : '30일')} />
            <View style={styles.metricRow}>
              <Metric label="하락 품목" value={`${downTop.length}개`} tone="success" />
              <Metric label="상승 품목" value={`${upTop.length}개`} tone="danger" />
              <Metric label="조회 기간" value={period} tone="info" />
            </View>
            <SectionTitle title="하락 Top" />
            {downTop.map((entry) => (
                <PriceRow
                  key={entry.id}
                  name={entry.name}
                  meta={`${entry.categoryName} · ${entry.unit}`}
                  price={entry.avgPrice}
                  changeRate={entry.changeRate7d}
                  decision={entry.decision}
                  onPress={() => navigation.navigate('ItemDetail', { itemId: entry.id })}
                />
              ))}
            <SectionTitle title="상승 주의" />
            {upTop.map((entry) => (
                <PriceRow
                  key={entry.id}
                  name={entry.name}
                  meta={entry.reason}
                  price={entry.avgPrice}
                  changeRate={entry.changeRate7d}
                  decision={entry.decision}
                  onPress={() => navigation.navigate('ItemDecision', { itemId: entry.id })}
                />
              ))}
          </>
        );
      }

      case 'recommendations':
        return (
          <>
            <DecisionFilterRow selected={decisionFilter} onSelect={setDecisionFilter} />
            {recommendations.map((entry) => (
              <PriceRow
                key={entry.id}
                name={entry.name}
                meta={entry.reason}
                price={entry.avgPrice}
                changeRate={entry.changeRate7d}
                decision={entry.decision}
                onPress={() => navigation.navigate('ItemDecision', { itemId: entry.id })}
              />
            ))}
          </>
        );

      case 'priceChanges': {
        const changeItems =
          priceChangesResource.data?.items ??
          priceItems.map((entry) => ({
            itemId: entry.id,
            name: entry.name,
            avgPrice: entry.avgPrice,
            changeRate7d: entry.changeRate7d,
            decision: entry.decision,
          }));

        return (
          <>
            <ChipRow options={['상승', '하락']} selected="상승" />
            <SectionTitle title="많이 오른 품목" />
            {changeItems
              .filter((entry) => entry.changeRate7d > 0)
              .sort((a, b) => b.changeRate7d - a.changeRate7d)
              .map((entry) => (
                <PriceRow
                  key={entry.itemId}
                  name={entry.name}
                  meta="7일 변동률 기준"
                  price={entry.avgPrice}
                  changeRate={entry.changeRate7d}
                  decision={entry.decision}
                  onPress={() => navigation.navigate('ItemDetail', { itemId: entry.itemId })}
                />
              ))}
            <SectionTitle title="많이 내린 품목" />
            {changeItems
              .filter((entry) => entry.changeRate7d < 0)
              .sort((a, b) => a.changeRate7d - b.changeRate7d)
              .slice(0, 4)
              .map((entry) => (
                <PriceRow
                  key={entry.itemId}
                  name={entry.name}
                  meta="7일 변동률 기준"
                  price={entry.avgPrice}
                  changeRate={entry.changeRate7d}
                  decision={entry.decision}
                  onPress={() => navigation.navigate('ItemDetail', { itemId: entry.itemId })}
                />
              ))}
          </>
        );
      }

      case 'recentItems':
        return (
          <>
            {priceItems.slice(0, 5).map((entry) => (
              <PriceRow
                key={entry.id}
                name={entry.name}
                meta={`최근 조회 · ${entry.updatedAt}`}
                price={entry.avgPrice}
                changeRate={entry.changeRate7d}
                decision={entry.decision}
                onPress={() => navigation.navigate('ItemDetail', { itemId: entry.id })}
              />
            ))}
          </>
        );

      case 'searchResults':
        return (
          <>
            <ChipRow options={sortOptions} selected="인기순" />
            {searchItems.slice(0, 6).map((entry) => (
              <PriceRow
                key={entry.id}
                name={entry.name}
                meta={`${params.keyword ?? '추천'} 검색 결과`}
                price={entry.avgPrice}
                changeRate={entry.changeRate7d}
                decision={entry.decision}
                onPress={() => navigation.navigate('ItemDetail', { itemId: entry.id })}
              />
            ))}
          </>
        );

      case 'searchEmpty':
        return (
          <>
            <EmptyState
              title="검색 결과가 없습니다"
              description={`${params.keyword ?? '입력한 검색어'}와 일치하는 품목이 없습니다.`}
              actionLabel="계란 검색"
              onPress={() => navigation.navigate('SearchResults', { keyword: '계란' })}
            />
            <ChipRow options={['계란', '쌀', '우유', '세탁세제']} selected="계란" />
          </>
        );

      case 'categories':
        return (
          <>
            {liveCategories.map((entry) => (
              <Pressable
                key={entry.id}
                style={styles.listRow}
                onPress={() =>
                  navigation.navigate('CategoryItems', {
                    categoryId: entry.id,
                    categoryName: entry.name,
                  })
                }
              >
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{entry.name}</Text>
                  <Text style={styles.rowMeta}>{entry.description}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </>
        );

      case 'categoryItems':
        return (
          <>
            <SectionTitle title={params.categoryName ?? category.name} action={`${categoryItems.length}개`} />
            <ChipRow options={sortOptions} selected="인기순" />
            {categoryItems.map((entry) => (
              <PriceRow
                key={entry.id}
                name={entry.name}
                meta={`${entry.categoryName} · ${entry.unit}`}
                price={entry.avgPrice}
                changeRate={entry.changeRate7d}
                decision={entry.decision}
                onPress={() => navigation.navigate('ItemDetail', { itemId: entry.id })}
              />
            ))}
          </>
        );

      case 'filter':
        return (
          <>
            <Card>
              <SectionTitle title="카테고리" />
              <View style={styles.wrap}>
                {liveCategories.map((entry) => (
                  <Chip key={entry.id} label={entry.name} selected={entry.id === 'farm'} />
                ))}
              </View>
            </Card>
            <Card>
              <SectionTitle title="가격 범위" />
              <InfoRow label="최소" value="1,000원" />
              <InfoRow label="최대" value="30,000원" />
            </Card>
            <Button label="적용" onPress={() => navigation.goBack()} />
            <Button label="초기화" variant="secondary" onPress={() => navigation.goBack()} />
          </>
        );

      case 'itemDetail':
        return <ItemOverview item={item} navigation={navigation} />;

      case 'itemBasic': {
        const basic = itemBasicResource.data;
        const nutrition =
          basic?.nutrition && basic.nutrition.length > 0
            ? basic.nutrition
            : item.nutrition ?? [{ label: '제공 상태', value: '식품영양성분 DB 연동 필요' }];

        return (
          <>
            <Card>
              <SectionTitle title={basic?.itemMeta.name ?? item.name} />
              <InfoRow label="카테고리" value={basic?.itemMeta.categoryName ?? item.categoryName} />
              <InfoRow label="단위/규격" value={basic?.itemMeta.unit ?? item.unit} />
              <InfoRow label="기준 지역" value={region} />
              <InfoRow label="원천" value={basic?.source ?? item.source} />
            </Card>
            <Card>
              <SectionTitle title="영양 정보" />
              {nutrition.map((entry) => (
                <InfoRow key={entry.label} label={entry.label} value={entry.value} />
              ))}
            </Card>
          </>
        );
      }

      case 'itemPrices': {
        const priceInfo = itemPricesResource.data;
        const sellers = priceInfo?.stores ?? item.sellers;

        return (
          <>
            <View style={styles.metricRow}>
              <Metric label="현재 평균" value={formatWon(priceInfo?.avg ?? item.avgPrice)} />
              <Metric label="최저" value={formatWon(priceInfo?.min ?? item.minPrice)} tone="success" />
              <Metric label="최고" value={formatWon(priceInfo?.max ?? item.maxPrice)} tone="danger" />
            </View>
            <SectionTitle title="판매처 요약" action={priceInfo?.region ?? region} />
            {sellers.map((seller) => (
              <InfoRow
                key={seller.name}
                label={`${seller.name}${seller.distance ? ` · ${seller.distance}` : ''}`}
                value={formatWon(seller.price)}
              />
            ))}
          </>
        );
      }

      case 'priceTrend': {
        const trend = itemTrendResource.data;
        const values = trend?.priceSeries.map((entry) => entry.price) ?? item.trend;

        return (
          <>
            <ChipRow options={periodOptions} selected={period} onSelect={setPeriod} />
            <Card>
              <SectionTitle title={`${item.name} 가격 추이`} action={period} />
              <MiniChart values={values} />
              <InfoRow label="전주 대비" value={`${(trend?.changeRate7d ?? item.changeRate7d) > 0 ? '+' : ''}${trend?.changeRate7d ?? item.changeRate7d}%`} />
              <InfoRow label="전월 대비" value={`${(trend?.changeRate30d ?? item.changeRate30d) > 0 ? '+' : ''}${trend?.changeRate30d ?? item.changeRate30d}%`} />
            </Card>
          </>
        );
      }

      case 'sellerPrices': {
        const sellers = itemSellersResource.data?.sellerPrices ?? item.sellers;

        return (
          <>
            <ChipRow options={['전체', '마트', '시장', '온라인']} selected="전체" />
            {[...sellers]
              .sort((a, b) => a.price - b.price)
              .map((seller) => (
                <View key={seller.name} style={styles.listRow}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle}>{seller.name}</Text>
                    <Text style={styles.rowMeta}>{seller.type}{seller.distance ? ` · ${seller.distance}` : ''}</Text>
                  </View>
                  <Text style={styles.priceText}>{formatWon(seller.price)}</Text>
                </View>
              ))}
          </>
        );
      }

      case 'itemDecision': {
        const decisionInfo = itemDecisionResource.data;
        const evidence =
          decisionInfo?.evidence ?? [
            { label: '30일 평균 대비', value: item.monthlyAvgPrice - item.avgPrice },
            { label: '7일 변동률', value: item.changeRate7d },
          ];

        return (
          <>
            <Card>
              <View style={styles.decisionHeader}>
                <Text style={styles.bigPrice}>{formatWon(item.avgPrice)}</Text>
                <DecisionBadge decision={decisionInfo?.decision ?? item.decision} />
              </View>
              <Text style={styles.bodyText}>{decisionInfo?.reason ?? item.reason}</Text>
              {evidence.map((entry) => (
                <InfoRow
                  key={entry.label}
                  label={entry.label}
                  value={
                    entry.label.includes('변동률')
                      ? `${entry.value > 0 ? '+' : ''}${entry.value}%`
                      : formatWon(entry.value)
                  }
                />
              ))}
            </Card>
            <Button label="장보기 담기" onPress={() => navigation.navigate('ShoppingEdit', { id: item.id })} />
            <Button label="가격 알림 만들기" variant="secondary" onPress={() => navigation.navigate('AlertEdit', { id: item.id })} />
            <Button label="대체 품목 보기" variant="text" onPress={() => navigation.navigate('Alternatives', { itemId: item.id })} />
          </>
        );
      }

      case 'buyDecision':
        return <DecisionList decision="BUY" navigation={navigation} items={recommendationsResource.data?.itemList} />;

      case 'waitDecision':
        return <DecisionList decision="WAIT" navigation={navigation} items={recommendationsResource.data?.itemList} />;

      case 'alternatives':
        return (
          <>
            {(alternativesResource.data?.alternatives ?? alternativeItems).map((entry) => (
              <Card key={`${entry.from}-${entry.to}`}>
                <SectionTitle title={entry.to} action={`${entry.savingRate}% 절감`} />
                <InfoRow label="기준 품목" value={entry.from} />
                <InfoRow label="예상 차액" value={formatWon(entry.priceGap)} />
                <Button label="상세 보기" variant="secondary" onPress={() => navigation.navigate('ItemDetail', { itemId: 'item_tuna' })} />
              </Card>
            ))}
          </>
        );

      case 'compareSelect':
        return (
          <>
            <Card>
              <SectionTitle title="비교할 품목" action={`${selectedCompareIds.length}/2`} />
              {searchItems.slice(0, 5).map((entry) => {
                const selected = selectedCompareIds.includes(entry.id);

                return (
                  <Pressable
                    key={entry.id}
                    style={[styles.selectRow, selected && styles.selectRowOn]}
                    onPress={() => {
                      setSelectedCompareIds((prev) => {
                        if (prev.includes(entry.id)) {
                          return prev.filter((id) => id !== entry.id);
                        }
                        return [...prev, entry.id].slice(-2);
                      });
                    }}
                  >
                    <Text style={styles.rowTitle}>{entry.name}</Text>
                    <Text style={styles.priceText}>{formatWon(entry.avgPrice)}</Text>
                  </Pressable>
                );
              })}
            </Card>
            <Button
              label="비교 결과 보기"
              disabled={selectedCompareIds.length < 2}
              onPress={() => navigation.navigate('CompareResult', { ids: selectedCompareIds })}
            />
          </>
        );

      case 'compareResult': {
        const winner =
          compareResultResource.data?.winner ??
          (selectedCompareItems[0].avgPrice <= selectedCompareItems[1].avgPrice
            ? selectedCompareItems[0]
            : selectedCompareItems[1]);
        const priceGap =
          compareResultResource.data?.priceGap ??
          Math.abs(selectedCompareItems[0].avgPrice - selectedCompareItems[1].avgPrice);

        return (
          <>
            <View style={styles.metricRow}>
              {selectedCompareItems.map((entry) => (
                <Metric key={entry.id} label={entry.name} value={formatWon(entry.avgPrice)} />
              ))}
            </View>
            <Card>
              <SectionTitle title="비교 요약" />
              <InfoRow label="더 저렴한 품목" value={winner.name} />
              <InfoRow label="가격 차이" value={formatWon(priceGap)} />
              <InfoRow label="추천 판단" value="낮은 가격과 하락 흐름 품목 우선" />
            </Card>
            <Button label="장보기 추가" onPress={() => navigation.navigate('ShoppingEdit', { id: winner.id })} />
          </>
        );
      }

      case 'compareRegions': {
        const regionRows =
          compareRegionsResource.data?.regions ??
          [
            { regionName: region, avgPrice: item.avgPrice },
            { regionName: '전국 평균', avgPrice: item.avgPrice + 420 },
            { regionName: '서울 마포구', avgPrice: item.avgPrice + 680 },
            { regionName: '대전 서구', avgPrice: item.avgPrice - 210 },
          ];

        return (
          <>
            <SectionTitle title={`${item.name} 지역별 가격`} />
            {regionRows.map((entry) => (
              <InfoRow key={entry.regionName} label={entry.regionName} value={formatWon(entry.avgPrice)} />
            ))}
          </>
        );
      }

      case 'compareStores': {
        const stores = compareStoresResource.data?.stores ?? item.sellers;

        return (
          <>
            <SectionTitle title={`${item.name} 판매처별 비교`} />
            {stores.map((seller) => (
              <InfoRow key={seller.name} label={seller.name} value={formatWon(seller.price)} />
            ))}
          </>
        );
      }

      case 'shoppingEdit':
        return (
          <ShoppingEditForm item={item} routeId={routeId} navigation={navigation} />
        );

      case 'shoppingBudget': {
        const total =
          shoppingBudgetResource.data?.total ??
          shoppingItems.reduce((sum, entry) => sum + entry.expectedPrice * entry.quantity, 0);
        const apiBudget = shoppingBudgetResource.data?.budget ?? budget;
        const remaining = shoppingBudgetResource.data?.remaining ?? apiBudget - total;

        return (
          <>
            <View style={styles.metricRow}>
              <Metric label="월 예산" value={formatWon(apiBudget)} />
              <Metric label="예상 지출" value={formatWon(total)} tone={remaining >= 0 ? 'success' : 'danger'} />
            </View>
            <Card>
              <SectionTitle title="잔여 예산" action={remaining >= 0 ? '여유' : '초과'} />
              <Text style={[styles.bigPrice, remaining < 0 && styles.dangerText]}>{formatWon(Math.abs(remaining))}</Text>
              <Text style={styles.bodyText}>{remaining >= 0 ? '현재 목록은 예산 안에 있습니다.' : '예산을 초과했습니다. 품목을 조정해보세요.'}</Text>
            </Card>
          </>
        );
      }

      case 'shoppingComplete': {
        const checkedItems = (shoppingListResource.data?.items ?? shoppingItems).filter((entry) => entry.checked);

        return (
          <>
            <Card>
              <SectionTitle title="구매 처리 대상" action="체크 품목" />
              {checkedItems.map((entry) => (
                  <InfoRow key={entry.id} label={entry.name} value={formatWon(entry.expectedPrice)} />
                ))}
            </Card>
            <Button
              label="구매 완료 저장"
              onPress={() => {
                void jachwiApi.completePurchase().then(() => navigation.navigate('PurchaseHistory'));
              }}
            />
          </>
        );
      }

      case 'purchaseHistory':
        return (
          <>
            <ChipRow options={['2026년 5월', '2026년 4월']} selected="2026년 5월" />
            {(purchaseHistoryResource.data?.history ?? purchaseHistory).map((entry) => (
              <Card key={entry.id}>
                <SectionTitle title={entry.date} action={formatWon(entry.total)} />
                <Text style={styles.bodyText}>{entry.items.join(', ')}</Text>
                <Button label="재구매" variant="secondary" onPress={() => navigation.navigate('ShoppingEdit')} />
              </Card>
            ))}
          </>
        );

      case 'alertEdit':
        return (
          <AlertEditForm item={item} routeId={routeId} navigation={navigation} />
        );

      case 'alertHistory':
        return (
          <>
            {(alertHistoryResource.data?.history ?? alertHistory).map((entry) => (
              <View key={entry.id} style={styles.listRow}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{entry.title}</Text>
                  <Text style={styles.rowMeta}>{entry.body}</Text>
                </View>
                <Text style={[styles.statusText, entry.read || allAlertHistoryRead ? styles.mutedText : styles.infoText]}>
                  {entry.read || allAlertHistoryRead ? '읽음' : '안읽음'}
                </Text>
              </View>
            ))}
            <Button label="전체 읽음" variant="secondary" onPress={() => setAllAlertHistoryRead(true)} />
          </>
        );

      case 'settings':
        return (
          <>
            <Card>
              <SectionTitle title="앱 설정" />
              <InfoRow label="기준 지역" value={region} />
              <InfoRow label="알림 스케줄" value="DAILY_09" />
            </Card>
            <Card>
              <SectionTitle title="약관/개인정보" />
              <Text style={styles.bodyText}>MVP에서는 거주 지역, 월 예산, 관심 카테고리만 저장합니다.</Text>
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenLayout title={spec.title} eyebrow={`${String(spec.screenNo).padStart(2, '0')} · ${spec.api}`} description={spec.routePath}>
      {resourceError ? (
        <Card compact>
          <Text style={styles.errorText}>서버 API 연결 실패: {resourceError}</Text>
        </Card>
      ) : null}
      {renderContent()}
      {spec.requiresPublicApiKey ? (
        <DataNotice updatedAt={item.updatedAt} source={item.source} />
      ) : null}
      {navigation.canGoBack?.() ? (
        <Button label="이전 화면" variant="secondary" onPress={() => navigation.goBack()} />
      ) : null}
    </ScreenLayout>
  );
}

function ShoppingEditForm({
  item,
  routeId,
  navigation,
}: {
  item: ShoppingEditSeed;
  routeId?: string;
  navigation: any;
}) {
  const isShoppingListItem = !!routeId && !routeId.startsWith('item_');
  const listResource = useApiResource(
    () => (isShoppingListItem ? jachwiApi.getShoppingList() : Promise.resolve(null)),
    [isShoppingListItem, routeId],
  );
  const existingItem = listResource.data?.items.find((entry) => entry.id === routeId);
  const [name, setName] = useState(item.name);
  const [quantityText, setQuantityText] = useState('1');
  const [priceText, setPriceText] = useState(String(item.avgPrice));
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setQuantityText(String(existingItem.quantity));
      setPriceText(String(existingItem.expectedPrice));
      setMemo(existingItem.memo ?? '');
      return;
    }

    setName(item.name);
    setQuantityText('1');
    setPriceText(String(item.avgPrice));
    setMemo('');
  }, [existingItem, item.id, item.avgPrice, item.name]);

  const handleSave = async () => {
    const quantity = Number(quantityText.replace(/[^0-9]/g, ''));
    const expectedPrice = Number(priceText.replace(/[^0-9]/g, ''));

    if (!name.trim() || quantity <= 0 || expectedPrice <= 0) {
      Alert.alert('입력 확인', '품목명, 수량, 예상 가격을 확인해 주세요.');
      return;
    }

    try {
      setSaving(true);

      if (existingItem) {
        await jachwiApi.patchShoppingItem(existingItem.id, {
          name: name.trim(),
          quantity,
          expectedPrice,
          memo: memo.trim() || undefined,
        });
      } else {
        await jachwiApi.addShoppingItem({
          itemId: item.id,
          name: name.trim(),
          quantity,
          expectedPrice,
          memo: memo.trim() || undefined,
        });
      }

      navigation.navigate('MainTabs', { screen: 'ShoppingTab' });
    } catch (error) {
      Alert.alert('장보기 저장 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existingItem) return;

    Alert.alert('품목 삭제', `${existingItem.name}을(를) 장보기 목록에서 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void jachwiApi
            .deleteShoppingItem(existingItem.id)
            .then(() => navigation.navigate('MainTabs', { screen: 'ShoppingTab' }))
            .catch((error: unknown) => {
              Alert.alert('삭제 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
            });
        },
      },
    ]);
  };

  return (
    <>
      <Card>
        <Text style={styles.label}>품목명</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="예: 계란 30구" />
        <Text style={styles.label}>수량</Text>
        <TextInput
          value={quantityText}
          onChangeText={setQuantityText}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="1"
        />
        <Text style={styles.label}>예상 가격</Text>
        <TextInput
          value={priceText}
          onChangeText={setPriceText}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="예: 8500"
        />
        <Text style={styles.label}>메모</Text>
        <TextInput value={memo} onChangeText={setMemo} style={styles.input} placeholder="선택 입력" />
        {listResource.error ? <Text style={styles.errorText}>{listResource.error}</Text> : null}
      </Card>
      <Button label={saving ? '저장 중' : '저장'} disabled={saving} onPress={() => void handleSave()} />
      {existingItem ? (
        <Button label="삭제" variant="secondary" disabled={saving} onPress={handleDelete} />
      ) : null}
    </>
  );
}

function AlertEditForm({
  item,
  routeId,
  navigation,
}: {
  item: ShoppingEditSeed;
  routeId?: string;
  navigation: any;
}) {
  const isAlertItem = !!routeId && routeId.startsWith('alert_');
  const alertsResource = useApiResource(
    () => (isAlertItem ? jachwiApi.getAlerts() : Promise.resolve(null)),
    [isAlertItem, routeId],
  );
  const existingAlert = alertsResource.data?.alerts.find((entry) => entry.id === routeId);
  const [selectedItemId, setSelectedItemId] = useState(item.id);
  const selectedItem = getItem(selectedItemId);
  const [targetPriceText, setTargetPriceText] = useState(String(Math.max(item.avgPrice - 300, 1000)));
  const [condition, setCondition] = useState<PriceAlert['condition']>('BELOW_TARGET');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingAlert) {
      setSelectedItemId(existingAlert.itemId);
      setTargetPriceText(String(existingAlert.targetPrice));
      setCondition(existingAlert.condition ?? 'BELOW_TARGET');
      return;
    }

    setSelectedItemId(item.id);
    setTargetPriceText(String(Math.max(item.avgPrice - 300, 1000)));
    setCondition('BELOW_TARGET');
  }, [existingAlert, item.avgPrice, item.id]);

  const handleSave = async () => {
    const targetPrice = Number(targetPriceText.replace(/[^0-9]/g, ''));

    if (targetPrice <= 0) {
      Alert.alert('입력 확인', '목표가를 입력해 주세요.');
      return;
    }

    try {
      setSaving(true);

      if (existingAlert) {
        await jachwiApi.patchAlert(existingAlert.id, {
          itemId: selectedItem.id,
          name: selectedItem.name,
          targetPrice,
          condition,
          schedule: 'DAILY_09',
        });
      } else {
        await jachwiApi.createAlert({
          itemId: selectedItem.id,
          targetPrice,
          condition,
          schedule: 'DAILY_09',
        });
      }

      navigation.navigate('MainTabs', { screen: 'AlertsTab' });
    } catch (error) {
      Alert.alert('알림 저장 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <Text style={styles.label}>품목</Text>
        <View style={styles.wrap}>
          {priceItems.slice(0, 6).map((entry) => (
            <Chip
              key={entry.id}
              label={entry.name}
              selected={selectedItemId === entry.id}
              onPress={() => {
                setSelectedItemId(entry.id);
                setTargetPriceText(String(Math.max(entry.avgPrice - 300, 1000)));
              }}
            />
          ))}
        </View>
        <Text style={styles.label}>목표가</Text>
        <TextInput
          value={targetPriceText}
          onChangeText={setTargetPriceText}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="예: 27000"
        />
        <Text style={styles.label}>조건</Text>
        <ChipRow
          options={['목표가 이하', '주간 하락', '신저가']}
          selected={
            condition === 'WEEKLY_DROP' ? '주간 하락' : condition === 'NEW_LOW' ? '신저가' : '목표가 이하'
          }
          onSelect={(value) => {
            setCondition(
              value === '주간 하락' ? 'WEEKLY_DROP' : value === '신저가' ? 'NEW_LOW' : 'BELOW_TARGET',
            );
          }}
        />
        <Text style={styles.helpText}>푸시 권한이 꺼져도 앱 안에서 알림 이력을 확인할 수 있습니다.</Text>
        {alertsResource.error ? <Text style={styles.errorText}>{alertsResource.error}</Text> : null}
      </Card>
      <Button label={saving ? '저장 중' : '알림 저장'} disabled={saving} onPress={() => void handleSave()} />
    </>
  );
}

function ItemOverview({ item, navigation }: { item: ReturnType<typeof getItem>; navigation: any }) {
  return (
    <>
      <Card>
        <View style={styles.decisionHeader}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.rowMeta}>{item.categoryName} · {item.unit}</Text>
          </View>
          <DecisionBadge decision={item.decision} />
        </View>
        <Text style={styles.bigPrice}>{formatWon(item.avgPrice)}</Text>
        <Text style={styles.bodyText}>{item.reason}</Text>
      </Card>
      <View style={styles.gridButtons}>
        <Button label="기본 정보" variant="secondary" onPress={() => navigation.navigate('ItemBasic', { itemId: item.id })} />
        <Button label="가격 정보" variant="secondary" onPress={() => navigation.navigate('ItemPrices', { itemId: item.id })} />
        <Button label="가격 추이" variant="secondary" onPress={() => navigation.navigate('PriceTrend', { itemId: item.id })} />
        <Button label="판매처별" variant="secondary" onPress={() => navigation.navigate('SellerPrices', { itemId: item.id })} />
      </View>
      <Button label="구매 판단 보기" onPress={() => navigation.navigate('ItemDecision', { itemId: item.id })} />
    </>
  );
}

function DecisionList({
  decision,
  navigation,
  items = priceItems,
}: {
  decision: Decision;
  navigation: any;
  items?: PriceItem[];
}) {
  return (
    <>
      {items
        .filter((entry) => entry.decision === decision)
        .map((entry) => (
          <PriceRow
            key={entry.id}
            name={entry.name}
            meta={entry.reason}
            price={entry.avgPrice}
            changeRate={entry.changeRate7d}
            decision={entry.decision}
            onPress={() => navigation.navigate('ItemDecision', { itemId: entry.id })}
          />
        ))}
    </>
  );
}

function DecisionFilterRow({
  selected,
  onSelect,
}: {
  selected: DecisionFilter;
  onSelect: (value: DecisionFilter) => void;
}) {
  return (
    <View style={styles.wrapWithMargin}>
      {[
        ['ALL', '전체'],
        ['BUY', 'BUY'],
        ['WAIT', 'WAIT'],
        ['REPLACE', 'REPLACE'],
      ].map(([value, label]) => (
        <Chip
          key={value}
          label={label}
          selected={selected === value}
          onPress={() => onSelect(value as DecisionFilter)}
        />
      ))}
    </View>
  );
}

function ChipRow({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <View style={styles.wrapWithMargin}>
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={option === selected}
          onPress={() => onSelect?.(option)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrapWithMargin: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  listRow: {
    minHeight: 68,
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
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: 4,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 24,
  },
  priceText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  bigPrice: {
    color: colors.primary,
    fontSize: typography.price,
    fontWeight: '900',
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  dangerText: {
    color: colors.danger,
  },
  itemName: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  gridButtons: {
    gap: 10,
    marginBottom: 10,
  },
  selectRow: {
    minHeight: 52,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectRowOn: {
    borderColor: colors.info,
    backgroundColor: colors.infoSoft,
  },
  label: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  input: {
    minHeight: 46,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    color: colors.primary,
    fontSize: typography.body,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  mutedText: {
    color: colors.textMuted,
  },
  infoText: {
    color: colors.info,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
