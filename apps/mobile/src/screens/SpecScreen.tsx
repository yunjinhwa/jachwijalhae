import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  Decision,
  alertHistory,
  alternativeItems,
  categories,
  formatWon,
  getItem,
  getItemsByCategory,
  priceItems,
  purchaseHistory,
  shoppingItems,
} from '../data/mockData';
import { sourceCsvFiles } from '../data/fileDataSeeds';
import { ScreenSpec } from '../data/screenSpecs';
import {
  API_BASE_URL,
  ApiKeySlotId,
  apiKeySlots,
  getApiKeySlot,
  getExternalApisForScreen,
  publicDataSources,
} from '../services/apiClient';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';

type SpecScreenProps = {
  navigation: any;
  route: any;
  spec: ScreenSpec;
};

type DecisionFilter = Decision | 'ALL';

const periodOptions = ['7일', '30일', '90일'];
const sortOptions = ['인기순', '낮은 가격순', '변동률순'];

export function SpecScreen({ navigation, route, spec }: SpecScreenProps) {
  const params = route.params ?? {};
  const region = usePreferenceStore((state) => state.region);
  const budget = usePreferenceStore((state) => state.budget);
  const [period, setPeriod] = useState(periodOptions[0]);
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>('ALL');
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([
    priceItems[0].id,
    priceItems[1].id,
  ]);

  const item = getItem(params.itemId);
  const categoryId = params.categoryId ?? item.categoryId;
  const category = categories.find((entry) => entry.id === categoryId) ?? categories[0];
  const categoryItems = getItemsByCategory(categoryId);
  const selectedCompareItems = selectedCompareIds.map((id) => getItem(id));
  const externalApisForSpec = getExternalApisForScreen(spec.kind);

  const recommendations = useMemo(() => {
    if (decisionFilter === 'ALL') {
      return priceItems;
    }

    return priceItems.filter((entry) => entry.decision === decisionFilter);
  }, [decisionFilter]);

  const renderContent = () => {
    switch (spec.kind) {
      case 'priceSummary':
        return (
          <>
            <ChipRow options={['주간', '월간']} selected={period === '7일' ? '주간' : '월간'} onSelect={(value) => setPeriod(value === '주간' ? '7일' : '30일')} />
            <View style={styles.metricRow}>
              <Metric label="하락 품목" value="12개" tone="success" />
              <Metric label="상승 품목" value="7개" tone="danger" />
              <Metric label="안정 품목" value="21개" tone="info" />
            </View>
            <SectionTitle title="하락 Top" />
            {priceItems
              .filter((entry) => entry.changeRate7d < 0)
              .slice(0, 4)
              .map((entry) => (
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
            {priceItems
              .filter((entry) => entry.changeRate7d > 0)
              .slice(0, 3)
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

      case 'priceChanges':
        return (
          <>
            <ChipRow options={['상승', '하락']} selected="상승" />
            <SectionTitle title="많이 오른 품목" />
            {priceItems
              .filter((entry) => entry.changeRate7d > 0)
              .sort((a, b) => b.changeRate7d - a.changeRate7d)
              .map((entry) => (
                <PriceRow
                  key={entry.id}
                  name={entry.name}
                  meta="7일 변동률 기준"
                  price={entry.avgPrice}
                  changeRate={entry.changeRate7d}
                  decision={entry.decision}
                  onPress={() => navigation.navigate('ItemDetail', { itemId: entry.id })}
                />
              ))}
            <SectionTitle title="많이 내린 품목" />
            {priceItems
              .filter((entry) => entry.changeRate7d < 0)
              .sort((a, b) => a.changeRate7d - b.changeRate7d)
              .slice(0, 4)
              .map((entry) => (
                <PriceRow
                  key={entry.id}
                  name={entry.name}
                  meta="7일 변동률 기준"
                  price={entry.avgPrice}
                  changeRate={entry.changeRate7d}
                  decision={entry.decision}
                  onPress={() => navigation.navigate('ItemDetail', { itemId: entry.id })}
                />
              ))}
          </>
        );

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
            {priceItems.slice(0, 6).map((entry) => (
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
            {categories.map((entry) => (
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
                {categories.map((entry) => (
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
            <Button label="초기화" variant="secondary" />
          </>
        );

      case 'itemDetail':
        return <ItemOverview item={item} navigation={navigation} />;

      case 'itemBasic':
        return (
          <>
            <Card>
              <SectionTitle title={item.name} />
              <InfoRow label="카테고리" value={item.categoryName} />
              <InfoRow label="단위/규격" value={item.unit} />
              <InfoRow label="기준 지역" value={region} />
              <InfoRow label="원천" value={item.source} />
            </Card>
            <Card>
              <SectionTitle title="영양 정보" />
              {(item.nutrition ?? [{ label: '제공 상태', value: '식품영양성분 DB 연동 필요' }]).map((entry) => (
                <InfoRow key={entry.label} label={entry.label} value={entry.value} />
              ))}
            </Card>
          </>
        );

      case 'itemPrices':
        return (
          <>
            <View style={styles.metricRow}>
              <Metric label="현재 평균" value={formatWon(item.avgPrice)} />
              <Metric label="최저" value={formatWon(item.minPrice)} tone="success" />
              <Metric label="최고" value={formatWon(item.maxPrice)} tone="danger" />
            </View>
            <SectionTitle title="판매처 요약" />
            {item.sellers.map((seller) => (
              <InfoRow
                key={seller.name}
                label={`${seller.name}${seller.distance ? ` · ${seller.distance}` : ''}`}
                value={formatWon(seller.price)}
              />
            ))}
          </>
        );

      case 'priceTrend':
        return (
          <>
            <ChipRow options={periodOptions} selected={period} onSelect={setPeriod} />
            <Card>
              <SectionTitle title={`${item.name} 가격 추이`} action={period} />
              <MiniChart values={item.trend} />
              <InfoRow label="전주 대비" value={`${item.changeRate7d > 0 ? '+' : ''}${item.changeRate7d}%`} />
              <InfoRow label="전월 대비" value={`${item.changeRate30d > 0 ? '+' : ''}${item.changeRate30d}%`} />
            </Card>
          </>
        );

      case 'sellerPrices':
        return (
          <>
            <ChipRow options={['전체', '마트', '시장', '온라인']} selected="전체" />
            {item.sellers
              .sort((a, b) => a.price - b.price)
              .map((seller) => (
                <Pressable key={seller.name} style={styles.listRow}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle}>{seller.name}</Text>
                    <Text style={styles.rowMeta}>{seller.type}{seller.distance ? ` · ${seller.distance}` : ''}</Text>
                  </View>
                  <Text style={styles.priceText}>{formatWon(seller.price)}</Text>
                </Pressable>
              ))}
          </>
        );

      case 'itemDecision':
        return (
          <>
            <Card>
              <View style={styles.decisionHeader}>
                <Text style={styles.bigPrice}>{formatWon(item.avgPrice)}</Text>
                <DecisionBadge decision={item.decision} />
              </View>
              <Text style={styles.bodyText}>{item.reason}</Text>
              <InfoRow label="30일 평균 대비" value={formatWon(item.monthlyAvgPrice - item.avgPrice)} />
              <InfoRow label="7일 변동률" value={`${item.changeRate7d > 0 ? '+' : ''}${item.changeRate7d}%`} />
            </Card>
            <Button label="장보기 담기" onPress={() => navigation.navigate('ShoppingEdit', { id: item.id })} />
            <Button label="가격 알림 만들기" variant="secondary" onPress={() => navigation.navigate('AlertEdit', { id: item.id })} />
            <Button label="대체 품목 보기" variant="text" onPress={() => navigation.navigate('Alternatives', { itemId: item.id })} />
          </>
        );

      case 'buyDecision':
        return <DecisionList decision="BUY" navigation={navigation} />;

      case 'waitDecision':
        return <DecisionList decision="WAIT" navigation={navigation} />;

      case 'alternatives':
        return (
          <>
            {alternativeItems.map((entry) => (
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
              {priceItems.slice(0, 5).map((entry) => {
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
              onPress={() => navigation.navigate('CompareResult')}
            />
          </>
        );

      case 'compareResult':
        return (
          <>
            <View style={styles.metricRow}>
              {selectedCompareItems.map((entry) => (
                <Metric key={entry.id} label={entry.name} value={formatWon(entry.avgPrice)} />
              ))}
            </View>
            <Card>
              <SectionTitle title="비교 요약" />
              <InfoRow label="더 저렴한 품목" value={selectedCompareItems[0].avgPrice <= selectedCompareItems[1].avgPrice ? selectedCompareItems[0].name : selectedCompareItems[1].name} />
              <InfoRow label="가격 차이" value={formatWon(Math.abs(selectedCompareItems[0].avgPrice - selectedCompareItems[1].avgPrice))} />
              <InfoRow label="추천 판단" value="낮은 가격과 하락 흐름 품목 우선" />
            </Card>
            <Button label="장보기 추가" onPress={() => navigation.navigate('ShoppingEdit')} />
          </>
        );

      case 'compareRegions':
        return (
          <>
            <SectionTitle title={`${item.name} 지역별 가격`} />
            {[
              { name: region, price: item.avgPrice },
              { name: '전국 평균', price: item.avgPrice + 420 },
              { name: '서울 마포구', price: item.avgPrice + 680 },
              { name: '대전 서구', price: item.avgPrice - 210 },
            ].map((entry) => (
              <InfoRow key={entry.name} label={entry.name} value={formatWon(entry.price)} />
            ))}
          </>
        );

      case 'compareStores':
        return (
          <>
            <SectionTitle title={`${item.name} 판매처별 비교`} />
            {item.sellers.map((seller) => (
              <InfoRow key={seller.name} label={seller.name} value={formatWon(seller.price)} />
            ))}
          </>
        );

      case 'shoppingEdit':
        return (
          <>
            <Card>
              <Text style={styles.label}>품목명</Text>
              <TextInput value={item.name} style={styles.input} editable={false} />
              <Text style={styles.label}>수량</Text>
              <TextInput value="1" style={styles.input} editable={false} />
              <Text style={styles.label}>예상 가격</Text>
              <TextInput value={`${item.avgPrice}`} style={styles.input} editable={false} />
              <Text style={styles.label}>메모</Text>
              <TextInput value="Mock 저장 화면입니다." style={styles.input} editable={false} />
            </Card>
            <Button label="저장" onPress={() => navigation.navigate('MainTabs', { screen: 'ShoppingTab' })} />
          </>
        );

      case 'shoppingBudget': {
        const total = shoppingItems.reduce((sum, entry) => sum + entry.expectedPrice * entry.quantity, 0);
        const remaining = budget - total;

        return (
          <>
            <View style={styles.metricRow}>
              <Metric label="월 예산" value={formatWon(budget)} />
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

      case 'shoppingComplete':
        return (
          <>
            <Card>
              <SectionTitle title="구매 처리 대상" action="체크 품목" />
              {shoppingItems
                .filter((entry) => entry.checked)
                .map((entry) => (
                  <InfoRow key={entry.id} label={entry.name} value={formatWon(entry.expectedPrice)} />
                ))}
            </Card>
            <Button label="구매 완료 저장" onPress={() => navigation.navigate('PurchaseHistory')} />
          </>
        );

      case 'purchaseHistory':
        return (
          <>
            <ChipRow options={['2026년 5월', '2026년 4월']} selected="2026년 5월" />
            {purchaseHistory.map((entry) => (
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
          <>
            <Card>
              <Text style={styles.label}>품목</Text>
              <TextInput value={item.name} style={styles.input} editable={false} />
              <Text style={styles.label}>목표가</Text>
              <TextInput value={`${Math.max(item.avgPrice - 300, 1000)}`} style={styles.input} editable={false} />
              <Text style={styles.label}>조건</Text>
              <TextInput value="BELOW_TARGET" style={styles.input} editable={false} />
              <Text style={styles.helpText}>푸시 권한이 거부되면 앱 내 알림 이력만 제공합니다.</Text>
            </Card>
            <Button label="알림 저장" onPress={() => navigation.navigate('MainTabs', { screen: 'AlertsTab' })} />
          </>
        );

      case 'alertHistory':
        return (
          <>
            {alertHistory.map((entry) => (
              <Pressable key={entry.id} style={styles.listRow}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{entry.title}</Text>
                  <Text style={styles.rowMeta}>{entry.body}</Text>
                </View>
                <Text style={[styles.statusText, entry.read ? styles.mutedText : styles.infoText]}>
                  {entry.read ? '읽음' : '안읽음'}
                </Text>
              </Pressable>
            ))}
            <Button label="전체 읽음" variant="secondary" />
          </>
        );

      case 'settings':
        return (
          <>
            <Card>
              <SectionTitle title="앱 설정" />
              <InfoRow label="기준 지역" value={region} />
              <InfoRow label="알림 스케줄" value="DAILY_09" />
              <InfoRow label="API Base URL" value={API_BASE_URL} />
            </Card>
            <ServerApiKeySettings />
            <Card>
              <SectionTitle title="로컬 파일 데이터" />
              {sourceCsvFiles.map((file) => (
                <View key={file.id} style={styles.sourceBlock}>
                  <Text style={styles.rowTitle}>{file.name}</Text>
                  <Text style={styles.rowMeta}>{file.rowCount.toLocaleString('ko-KR')}행 · 기준일 {file.latestDate} · {file.encoding}</Text>
                </View>
              ))}
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
      {renderContent()}
      <SpecContract spec={spec} />
      {spec.requiresPublicApiKey ? (
        <DataNotice updatedAt={item.updatedAt} source={item.source} requiresApiKey={externalApisForSpec.length > 0} />
      ) : null}
      {navigation.canGoBack?.() ? (
        <Button label="이전 화면" variant="secondary" onPress={() => navigation.goBack()} />
      ) : null}
    </ScreenLayout>
  );
}

function ServerApiKeySettings() {
  const kamisSlot = apiKeySlots.find((slot) => slot.id === 'kamis');
  const publicDataSlots = apiKeySlots.filter((slot) => slot.id !== 'kamis');

  if (!kamisSlot) {
    return null;
  }

  return (
    <>
      <Card>
        <SectionTitle title="KAMIS API 키" action="서버에서 관리" />
        <Text style={styles.bodyText}>{kamisSlot.description}</Text>
        <InfoRow label="서버 환경변수" value={kamisSlot.envVarName} />
        <Text style={styles.helpText}>API 키는 모바일 앱에 입력하거나 저장하지 않습니다.</Text>
        <EndpointList slotId="kamis" />
      </Card>

      <Card>
        <SectionTitle title="공공데이터 API별 키" action="서버에서 관리" />
        {publicDataSlots.map((slot) => (
          <View key={slot.id} style={styles.sourceBlock}>
            <Text style={styles.rowTitle}>{slot.label}</Text>
            <Text style={styles.rowMeta}>{slot.description}</Text>
            <InfoRow label="서버 환경변수" value={slot.envVarName} />
            <EndpointList slotId={slot.id} />
          </View>
        ))}
      </Card>
    </>
  );
}

function EndpointList({ slotId }: { slotId: ApiKeySlotId }) {
  const endpoints = publicDataSources
    .flatMap((source) => source.endpoints)
    .filter((endpoint) => endpoint.keySlotId === slotId);

  return (
    <View style={styles.externalApiBlock}>
      {endpoints.map((endpoint) => (
        <Text key={`${slotId}-${endpoint.url}`} style={styles.endpointText} selectable>
          {endpoint.label}: {endpoint.url}
        </Text>
      ))}
    </View>
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

function DecisionList({ decision, navigation }: { decision: Decision; navigation: any }) {
  return (
    <>
      {priceItems
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

function SpecContract({ spec }: { spec: ScreenSpec }) {
  const externalApis = getExternalApisForScreen(spec.kind);

  return (
    <Card compact>
      <SectionTitle title="연동 정보" />
      <InfoRow label="route" value={spec.routePath} />
      <InfoRow label="api" value={spec.api} />
      <InfoRow label="state" value={spec.state} />
      {externalApis.length > 0 ? (
        <View style={styles.externalApiBlock}>
          <Text style={styles.label}>외부 API 엔드포인트</Text>
          {externalApis.map((endpoint) => (
            <Text key={`${spec.kind}-${endpoint.url}`} style={styles.endpointText} selectable>
              {endpoint.label} · {getApiKeySlot(endpoint.keySlotId)?.envVarName}: {endpoint.url}
            </Text>
          ))}
        </View>
      ) : null}
      <Text style={styles.noteText}>{spec.notes.join(' · ')}</Text>
    </Card>
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
  sourceBlock: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    gap: 4,
  },
  externalApiBlock: {
    gap: 6,
  },
  endpointText: {
    color: colors.info,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  noteText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
