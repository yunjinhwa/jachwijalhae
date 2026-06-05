import { csvPriceSeedByItemId } from './fileDataSeeds';

export type Decision = 'BUY' | 'WAIT' | 'REPLACE' | 'NEUTRAL';

export type PriceItem = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  avgPrice: number;
  monthlyAvgPrice: number;
  minPrice: number;
  maxPrice: number;
  changeRate7d: number;
  changeRate30d: number;
  decision: Decision;
  reason: string;
  source: string;
  updatedAt: string;
  sourceFileId?: string;
  sourceProductName?: string;
  keywords: string[];
  trend: number[];
  sellers: Array<{
    type: 'MART' | 'MARKET' | 'ONLINE' | 'RETAIL';
    name: string;
    price: number;
    distance?: string;
  }>;
  nutrition?: Array<{ label: string; value: string }>;
};

const eggSeed = csvPriceSeedByItemId.item_egg_30;
const riceSeed = csvPriceSeedByItemId.item_rice_10;
const milkSeed = csvPriceSeedByItemId.item_milk_1;
const detergentSeed = csvPriceSeedByItemId.item_detergent;
const tunaSeed = csvPriceSeedByItemId.item_tuna;
const tissueSeed = csvPriceSeedByItemId.item_tissue;
const ramenSeed = csvPriceSeedByItemId.item_ramen;
const greenOnionSeed = csvPriceSeedByItemId.item_green_onion;

export const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`;

export const categories = [
  { id: 'daily', name: '생필품', description: '휴지, 세제, 샴푸 등 생활용품' },
  { id: 'farm', name: '농산물', description: '채소, 과일, 곡류' },
  { id: 'livestock', name: '축산물', description: '계란, 닭고기, 돼지고기, 소고기' },
  { id: 'seafood', name: '수산물', description: '생선, 해산물, 건어물' },
  { id: 'processed', name: '가공식품', description: '라면, 즉석식품, 조미료' },
  { id: 'personal', name: '개인위생', description: '치약, 비누, 여성용품' },
];

const basePriceItems: PriceItem[] = [
  {
    id: 'item_egg_30',
    name: '계란 30구',
    categoryId: 'livestock',
    categoryName: '축산물',
    unit: '30구',
    avgPrice: 6200,
    monthlyAvgPrice: 6780,
    minPrice: 5900,
    maxPrice: 7100,
    changeRate7d: -8,
    changeRate30d: -4,
    decision: 'BUY',
    reason: '30일 평균보다 낮고 최근 가격 흐름이 안정적입니다.',
    source: '한국소비자원/KAMIS',
    updatedAt: '2026-05-21 09:00',
    keywords: ['계란', '달걀', 'egg'],
    trend: [6900, 6750, 6650, 6500, 6400, 6280, 6200],
    sellers: [
      { type: 'MARKET', name: '사상시장 평균', price: 5900, distance: '1.2km' },
      { type: 'MART', name: '대형마트 평균', price: 6400, distance: '2.0km' },
      { type: 'ONLINE', name: '온라인몰 평균', price: 6750 },
    ],
    nutrition: [
      { label: '열량', value: '68kcal/개' },
      { label: '단백질', value: '6.3g/개' },
    ],
  },
  {
    id: 'item_rice_10',
    name: '쌀 10kg',
    categoryId: 'farm',
    categoryName: '농산물',
    unit: '10kg',
    avgPrice: 28900,
    monthlyAvgPrice: 29600,
    minPrice: 27500,
    maxPrice: 31200,
    changeRate7d: -2.1,
    changeRate30d: 1.6,
    decision: 'BUY',
    reason: '최근 평균가 대비 낮고 변동성이 낮습니다.',
    source: 'KAMIS',
    updatedAt: '2026-05-21 06:00',
    keywords: ['쌀', '백미', 'rice'],
    trend: [30100, 29900, 29600, 29300, 29100, 29000, 28900],
    sellers: [
      { type: 'MARKET', name: '전통시장 평균', price: 27500, distance: '1.4km' },
      { type: 'MART', name: '대형마트 평균', price: 29200, distance: '2.3km' },
      { type: 'ONLINE', name: '온라인몰 평균', price: 30400 },
    ],
  },
  {
    id: 'item_milk_1',
    name: '우유 1L',
    categoryId: 'processed',
    categoryName: '가공식품',
    unit: '1L',
    avgPrice: 2450,
    monthlyAvgPrice: 2440,
    minPrice: 2300,
    maxPrice: 2680,
    changeRate7d: 0.4,
    changeRate30d: 0.8,
    decision: 'NEUTRAL',
    reason: '가격이 평균 수준입니다. 필요하면 구매하세요.',
    source: '한국소비자원',
    updatedAt: '2026-05-21 09:00',
    keywords: ['우유', 'milk'],
    trend: [2420, 2440, 2450, 2440, 2460, 2450, 2450],
    sellers: [
      { type: 'MART', name: '대형마트 평균', price: 2380, distance: '2.0km' },
      { type: 'MARKET', name: '동네마트 평균', price: 2480, distance: '800m' },
      { type: 'ONLINE', name: '온라인몰 평균', price: 2590 },
    ],
    nutrition: [
      { label: '열량', value: '130kcal/200ml' },
      { label: '칼슘', value: '210mg/200ml' },
    ],
  },
  {
    id: 'item_detergent',
    name: '세탁세제 3L',
    categoryId: 'daily',
    categoryName: '생필품',
    unit: '3L',
    avgPrice: 14500,
    monthlyAvgPrice: 13200,
    minPrice: 12800,
    maxPrice: 16900,
    changeRate7d: 9.4,
    changeRate30d: 7.6,
    decision: 'WAIT',
    reason: '최근 평균보다 높거나 상승 흐름입니다. 목표가 알림을 설정해보세요.',
    source: '한국소비자원',
    updatedAt: '2026-05-21 09:00',
    keywords: ['세제', '세탁세제', 'detergent'],
    trend: [13100, 13200, 13400, 13900, 14200, 14400, 14500],
    sellers: [
      { type: 'ONLINE', name: '온라인몰 평균', price: 12800 },
      { type: 'MART', name: '대형마트 평균', price: 14900, distance: '2.2km' },
      { type: 'MARKET', name: '동네마트 평균', price: 15800, distance: '900m' },
    ],
  },
  {
    id: 'item_tuna',
    name: '참치캔 12개',
    categoryId: 'processed',
    categoryName: '가공식품',
    unit: '12개',
    avgPrice: 12000,
    monthlyAvgPrice: 11700,
    minPrice: 10900,
    maxPrice: 13200,
    changeRate7d: 2,
    changeRate30d: 3.1,
    decision: 'REPLACE',
    reason: '비슷한 품목 중 더 저렴한 대체 품목이 있습니다.',
    source: '한국소비자원',
    updatedAt: '2026-05-21 09:00',
    keywords: ['참치', '참치캔', 'tuna'],
    trend: [11600, 11700, 11900, 12000, 12100, 12050, 12000],
    sellers: [
      { type: 'ONLINE', name: '온라인몰 평균', price: 10900 },
      { type: 'MART', name: '대형마트 평균', price: 12300, distance: '2.0km' },
      { type: 'MARKET', name: '동네마트 평균', price: 12800, distance: '900m' },
    ],
  },
  {
    id: 'item_tissue',
    name: '화장지 30롤',
    categoryId: 'daily',
    categoryName: '생필품',
    unit: '30롤',
    avgPrice: 15900,
    monthlyAvgPrice: 16600,
    minPrice: 14900,
    maxPrice: 18400,
    changeRate7d: -3.3,
    changeRate30d: -1.8,
    decision: 'BUY',
    reason: '월평균보다 낮고 온라인 최저가가 확인됩니다.',
    source: '한국소비자원',
    updatedAt: '2026-05-21 09:00',
    keywords: ['휴지', '화장지', 'tissue'],
    trend: [16800, 16600, 16400, 16200, 16000, 15900, 15900],
    sellers: [
      { type: 'ONLINE', name: '온라인몰 평균', price: 14900 },
      { type: 'MART', name: '대형마트 평균', price: 16200, distance: '2.2km' },
      { type: 'MARKET', name: '동네마트 평균', price: 17000, distance: '900m' },
    ],
  },
  {
    id: 'item_ramen',
    name: '라면 5개입',
    categoryId: 'processed',
    categoryName: '가공식품',
    unit: '5개',
    avgPrice: 4200,
    monthlyAvgPrice: 4050,
    minPrice: 3900,
    maxPrice: 4700,
    changeRate7d: 3.2,
    changeRate30d: 5.4,
    decision: 'WAIT',
    reason: '전주 대비 상승했습니다. 행사 가격을 기다려보세요.',
    source: '한국소비자원',
    updatedAt: '2026-05-21 09:00',
    keywords: ['라면', 'ramen'],
    trend: [3980, 4020, 4080, 4100, 4150, 4180, 4200],
    sellers: [
      { type: 'MART', name: '대형마트 평균', price: 3980, distance: '2.1km' },
      { type: 'MARKET', name: '동네마트 평균', price: 4300, distance: '700m' },
      { type: 'ONLINE', name: '온라인몰 평균', price: 4450 },
    ],
  },
  {
    id: 'item_green_onion',
    name: '대파 1단',
    categoryId: 'farm',
    categoryName: '농산물',
    unit: '1단',
    avgPrice: 2800,
    monthlyAvgPrice: 3100,
    minPrice: 2500,
    maxPrice: 3600,
    changeRate7d: -9.8,
    changeRate30d: -12.1,
    decision: 'BUY',
    reason: '최근 하락폭이 크고 지역 평균가가 낮습니다.',
    source: 'KAMIS',
    updatedAt: '2026-05-21 06:00',
    keywords: ['대파', '파', 'green onion'],
    trend: [3400, 3300, 3180, 3050, 2950, 2860, 2800],
    sellers: [
      { type: 'MARKET', name: '전통시장 평균', price: 2500, distance: '1.2km' },
      { type: 'MART', name: '대형마트 평균', price: 2900, distance: '2.3km' },
      { type: 'ONLINE', name: '온라인몰 평균', price: 3300 },
    ],
  },
];

export const priceItems: PriceItem[] = basePriceItems.map((item) => {
  const seed = csvPriceSeedByItemId[item.id];

  if (!seed) {
    return item;
  }

  const priceRatio = seed.avgPrice / item.avgPrice;

  return {
    ...item,
    name: seed.displayName,
    unit: seed.unit,
    avgPrice: seed.avgPrice,
    monthlyAvgPrice: Math.round(seed.avgPrice / (1 + item.changeRate30d / 100)),
    minPrice: seed.minPrice,
    maxPrice: seed.maxPrice,
    source: seed.sourceName,
    updatedAt: seed.observedAt,
    sourceFileId: seed.sourceFileId,
    sourceProductName: seed.sourceProductName,
    trend: item.trend.map((value) => Math.round(value * priceRatio)),
    sellers: seed.sellerSummary,
  };
});

export const shoppingItems = [
  { id: 'shop_1', itemId: 'item_egg_30', name: eggSeed.displayName, quantity: 1, expectedPrice: eggSeed.avgPrice, checked: true },
  { id: 'shop_2', itemId: 'item_rice_10', name: riceSeed.displayName, quantity: 1, expectedPrice: riceSeed.avgPrice, checked: false },
  { id: 'shop_3', itemId: 'item_tissue', name: tissueSeed.displayName, quantity: 1, expectedPrice: tissueSeed.avgPrice, checked: false },
];

export const priceAlerts = [
  { id: 'alert_1', itemId: 'item_rice_10', name: riceSeed.displayName, targetPrice: 27000, enabled: true, reached: false },
  { id: 'alert_2', itemId: 'item_milk_1', name: milkSeed.displayName, targetPrice: 3000, enabled: true, reached: false },
  { id: 'alert_3', itemId: 'item_egg_30', name: eggSeed.displayName, targetPrice: 8000, enabled: false, reached: false },
];

export const purchaseHistory = [
  { id: 'p_1', date: '2026-05-18', total: 15655, items: [eggSeed.displayName, ramenSeed.displayName, milkSeed.displayName] },
  { id: 'p_2', date: '2026-05-11', total: 47450, items: [riceSeed.displayName, tissueSeed.displayName] },
  { id: 'p_3', date: '2026-04-27', total: 14191, items: [greenOnionSeed.displayName, tunaSeed.displayName] },
];

export const alertHistory = [
  { id: 'ah_1', title: '우유 1L 가격 확인', body: '소비자원 CSV 기준 서울우유 흰우유 1L 평균가는 3,120원입니다.', read: false },
  { id: 'ah_2', title: '대파 1kg 부산 표본', body: 'KAMIS CSV 기준 부산 소매 표본 평균가는 4,650원입니다.', read: true },
  { id: 'ah_3', title: '세탁세제 상승 주의', body: '7일 변동률이 9.4%입니다.', read: true },
];

export const alternativeItems = [
  { from: tunaSeed.displayName, to: '사조참치 살코기 안심따개 4캔', savingRate: 6, priceGap: 529 },
  { from: detergentSeed.displayName, to: '홈스타 락스와세제 750ml', savingRate: 63, priceGap: 7472 },
  { from: ramenSeed.displayName, to: '진라면 매운맛 5개입', savingRate: 5, priceGap: 205 },
];

export function getItem(itemId?: string) {
  return priceItems.find((item) => item.id === itemId) ?? priceItems[0];
}

export function getItemsByCategory(categoryId?: string) {
  if (!categoryId) {
    return priceItems;
  }

  return priceItems.filter((item) => item.categoryId === categoryId);
}
