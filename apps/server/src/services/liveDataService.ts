import { XMLParser } from 'fast-xml-parser';

import { env, isApiKeyConfigured } from '../config/env.js';
import { externalApiEndpoints } from '../config/externalApis.js';
import { Decision, PriceItem, SellerType, priceItems } from '../data/catalog.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const PARTIAL_CACHE_TTL_MS = 2 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15000;
const NUTRITION_REQUEST_TIMEOUT_MS = 4000;
const DEFAULT_KAMIS_COUNTY_CODE = '1101';
const CONSUMER_FALLBACK_INSPECT_DAY = '20241220';
const CONSUMER_AUTO_STORE_LIMIT = Number(process.env.CONSUMER_STORE_LIMIT ?? 120);
const CONSUMER_PRICE_BATCH_SIZE = Number(process.env.CONSUMER_PRICE_BATCH_SIZE ?? 8);

type CacheState = {
  expiresAt: number;
  items: PriceItem[];
  diagnostics: string[];
};

type KamisRetailRow = {
  countyname?: string;
  marketname?: string;
  yyyy?: string | number;
  regday?: string;
  price?: string | number;
};

type ConsumerPriceRow = {
  goodInspectDay?: string | number;
  entpId?: string | number;
  goodId?: string | number;
  goodPrice?: string | number;
};

type ConsumerProductRow = {
  goodId?: string | number;
  goodName?: string;
  detailMean?: string;
  goodTotalCnt?: string | number;
  goodTotalDivCode?: string;
  goodSmlclsCode?: string | number;
};

type ConsumerStoreRow = {
  entpId?: string | number;
  entpName?: string;
  entpTypeCode?: string;
};

type KamisCountyRow = {
  category_name?: string;
  productno?: string | number;
  lastest_day?: string;
  productName?: string;
  item_name?: string;
  unit?: string;
  dpr1?: string | number;
  dpr2?: string | number;
  dpr3?: string | number;
  value?: string | number;
};

type ConsumerGoodConfig = {
  itemId: string;
  goods: Array<{ goodId: string; name: string }>;
};

type FoodNutritionRow = {
  FOOD_NM_KR?: string;
  SERVING_SIZE?: string;
  AMT_NUM1?: string;
  AMT_NUM3?: string;
  AMT_NUM4?: string;
  AMT_NUM6?: string;
  AMT_NUM13?: string;
};

type KamisItemConfig = {
  itemId: string;
  sourceName: string;
  itemcategorycode: string;
  itemcode: string;
  kindcode: string;
  productrankcode?: string;
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
});

let cache: CacheState | undefined;
let inFlightItems: Promise<PriceItem[]> | undefined;
const nutritionCache = new Map<string, Array<{ label: string; value: string }>>();

const kamisItemConfigs: KamisItemConfig[] = [
  {
    itemId: 'item_rice_10',
    sourceName: '쌀 10kg',
    itemcategorycode: '100',
    itemcode: '111',
    kindcode: '10',
    productrankcode: '04',
  },
  {
    itemId: 'item_green_onion',
    sourceName: '대파 1kg',
    itemcategorycode: '200',
    itemcode: '246',
    kindcode: '00',
    productrankcode: '04',
  },
];

const consumerGoodConfigs: ConsumerGoodConfig[] = [
  {
    itemId: 'item_egg_30',
    goods: [
      { goodId: '1073', name: '목초를 먹고 자란 건강한 닭이 낳은 달걀(15개)' },
      { goodId: '1075', name: 'CJ 1등급 깨끗한 계란(15개)' },
    ],
  },
  {
    itemId: 'item_milk_1',
    goods: [{ goodId: '224', name: '서울우유 흰우유(1L)' }],
  },
  {
    itemId: 'item_detergent',
    goods: [
      { goodId: '1392', name: '스파크 분말세제(3kg)' },
      { goodId: '1274', name: '때가 쏙 비트 분말세제(6kg)' },
      { goodId: '1291', name: '홈스타 락스와세제 후로랄파인(750ml)' },
    ],
  },
  {
    itemId: 'item_tuna',
    goods: [
      { goodId: '1219', name: '동원참치 라이트스탠다드(4캔)' },
      { goodId: '1218', name: '사조참치 살코기 안심따개(4캔)' },
    ],
  },
  {
    itemId: 'item_tissue',
    goods: [
      { goodId: '1320', name: '크리넥스 순수소프트 3겹 화장지(30롤)' },
      { goodId: '1563', name: '크리넥스 수프림소프트 3겹 화장지(30롤)' },
      { goodId: '1561', name: '코디 순백 3겹(30롤)' },
      { goodId: '1564', name: '크리넥스 클린케어 3겹(30롤)' },
      { goodId: '1565', name: '크리넥스 울트라클린 3겹(30롤)' },
      { goodId: '1710', name: '잘풀리는집 깨끗한 순앤순 3겹(30롤)' },
      { goodId: '1712', name: '크리넥스 데코엔소프트 3겹(30롤)' },
    ],
  },
  {
    itemId: 'item_ramen',
    goods: [
      { goodId: '553', name: '신라면(5개입)' },
      { goodId: '237', name: '삼양라면(5개입)' },
      { goodId: '1403', name: '진라면 매운맛(5개입)' },
    ],
  },
];

const consumerStoreIds = ['15', '16', '20', '100'];
const curatedConsumerGoodIds = new Set(
  consumerGoodConfigs.flatMap((config) => config.goods.map((good) => good.goodId)),
);

const nutritionQueries: Record<string, { query: string; preferredNames: string[] }> = {
  item_egg_30: { query: '달걀', preferredNames: ['달걀_삶은것'] },
  item_ramen: { query: '라면', preferredNames: ['라면'] },
};

const nutritionKeywordQueries = [
  { pattern: /계란|달걀/, query: '달걀', preferredNames: ['달걀_삶은것', '달걀'] },
  { pattern: /라면|신라면|진라면|열라면|삼양라면/, query: '라면', preferredNames: ['라면'] },
  { pattern: /우유/, query: '우유', preferredNames: ['우유'] },
  { pattern: /참치/, query: '참치', preferredNames: ['참치'] },
  { pattern: /쌀|백미/, query: '쌀', preferredNames: ['쌀'] },
  { pattern: /대파|파\(|파$/, query: '대파', preferredNames: ['대파'] },
  { pattern: /두부/, query: '두부', preferredNames: ['두부'] },
  { pattern: /김치/, query: '김치', preferredNames: ['배추김치', '김치'] },
  { pattern: /고추장/, query: '고추장', preferredNames: ['고추장'] },
  { pattern: /된장/, query: '된장', preferredNames: ['된장'] },
  { pattern: /식빵|빵/, query: '식빵', preferredNames: ['식빵'] },
];

function cloneItems(items: PriceItem[]) {
  return items.map((item) => ({
    ...item,
    keywords: [...item.keywords],
    trend: [...item.trend],
    sellers: item.sellers.map((seller) => ({ ...seller })),
    nutrition: item.nutrition?.map((entry) => ({ ...entry })),
  }));
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: unknown) {
  const normalized = String(value ?? '').replace(/[^\d.-]/g, '');
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asText(value: unknown) {
  if (Array.isArray(value)) return '';
  return String(value ?? '').trim();
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function safeItemId(prefix: string, id: unknown) {
  return `${prefix}_${String(id ?? '')
    .replace(/[^0-9a-zA-Z가-힣_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')}`;
}

function keywordTokens(name: string) {
  const withoutParens = name.replace(/\([^)]*\)/g, ' ');
  const normalized = withoutParens.replace(/[^\dA-Za-z가-힣]+/g, ' ');

  return unique(
    [name, withoutParens, ...normalized.split(/\s+/)]
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  ).slice(0, 8);
}

function getCategoryFromName(name: string) {
  if (/화장지|휴지|세제|샴푸|린스|비누|치약|칫솔|키친타월|물티슈|마스크|로션|면도|생리대/.test(name)) {
    return { categoryId: 'daily', categoryName: '생필품' };
  }

  if (/계란|달걀|닭|돼지|소고기|쇠고기|한우|우삼겹|삼겹|목살|우유|치즈|버터/.test(name)) {
    return { categoryId: 'livestock', categoryName: '축산물' };
  }

  if (/고등어|갈치|참치|어묵|오징어|새우|멸치|김\b|미역|해물/.test(name)) {
    return { categoryId: 'seafood', categoryName: '수산물' };
  }

  if (/쌀|콩|팥|감자|고구마|배추|상추|오이|호박|토마토|무|당근|양파|대파|마늘|사과|배|귤|수박|참외|바나나/.test(name)) {
    return { categoryId: 'farm', categoryName: '농산물' };
  }

  if (/라면|국수|빵|과자|커피|차|음료|주스|햄|소시지|참치|카레|즉석|만두|두부|식용유|간장|고추장|된장|설탕|소금|밀가루/.test(name)) {
    return { categoryId: 'processed', categoryName: '가공식품' };
  }

  if (/화장품|스킨|크림|클렌징|데오드란트/.test(name)) {
    return { categoryId: 'personal', categoryName: '개인위생' };
  }

  return { categoryId: 'processed', categoryName: '가공식품' };
}

function getKamisCategory(categoryName: string, productName: string) {
  if (/축산/.test(categoryName)) return { categoryId: 'livestock', categoryName: '축산물' };
  if (/수산/.test(categoryName)) return { categoryId: 'seafood', categoryName: '수산물' };
  if (/식량|채소|과일|특용|버섯/.test(categoryName)) return { categoryId: 'farm', categoryName: '농산물' };

  return getCategoryFromName(productName);
}

function buildTrend(current: number, previous?: number, monthly?: number) {
  if (monthly && previous) {
    const step = (previous - monthly) / 5;
    return [
      Math.round(monthly),
      Math.round(monthly + step),
      Math.round(monthly + step * 2),
      Math.round(monthly + step * 3),
      Math.round(monthly + step * 4),
      previous,
      current,
    ];
  }

  if (previous) {
    return [previous, previous, previous, previous, previous, previous, current];
  }

  return [current, current, current, current, current, current, current];
}

function unitCodeToText(code?: string) {
  if (code === 'G') return 'g';
  if (code === 'KG') return 'kg';
  if (code === 'ML') return 'ml';
  if (code === 'L') return 'L';
  if (code === 'EA') return '개';
  if (code === 'LO') return '롤';
  return code ?? '';
}

function getConsumerUnit(product: ConsumerProductRow) {
  const detail = asText(product.detailMean);
  if (detail) return detail;

  const totalCount = asText(product.goodTotalCnt);
  const totalCode = unitCodeToText(asText(product.goodTotalDivCode));

  return totalCount && totalCode ? `${totalCount}${totalCode}` : '1개';
}

function mergeUniqueItems(baseItems: PriceItem[], dynamicItems: PriceItem[]) {
  const byId = new Map<string, PriceItem>();

  for (const item of [...baseItems, ...dynamicItems]) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values());
}

function formatDate(date: Date, separator: '-' | '' = '-') {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return separator === '-' ? `${y}-${m}-${d}` : `${y}${m}${d}`;
}

function previousFriday() {
  const date = new Date();
  const day = date.getDay();
  const diff = day >= 5 ? day - 5 : day + 2;
  date.setDate(date.getDate() - diff);
  return formatDate(date, '');
}

function getKamisDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 14);

  return {
    startday: formatDate(start),
    endday: formatDate(end),
  };
}

function fromKamisDate(row: KamisRetailRow) {
  if (!row.yyyy || !row.regday) return '';

  const [month, day] = String(row.regday).split('/');
  return `${row.yyyy}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
}

function compactDateToIso(value: string) {
  if (value.length !== 8) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function getDecision(avgPrice: number, monthlyAvgPrice: number, changeRate7d: number): Decision {
  if (avgPrice <= monthlyAvgPrice * 0.98 || changeRate7d <= -2) return 'BUY';
  if (avgPrice >= monthlyAvgPrice * 1.05 || changeRate7d >= 3) return 'WAIT';
  return 'NEUTRAL';
}

function getReason(decision: Decision) {
  if (decision === 'BUY') return '최근 가격이 평균보다 낮거나 하락 흐름입니다.';
  if (decision === 'WAIT') return '최근 가격이 평균보다 높거나 상승 흐름입니다.';
  if (decision === 'REPLACE') return '비슷한 품목 중 더 저렴한 대체 품목이 있습니다.';
  return '가격이 평균 수준입니다.';
}

async function fetchText(url: string, timeoutMs = REQUEST_TIMEOUT_MS) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function appendRawServiceKey(
  baseUrl: string,
  keyName: string,
  keyValue: string,
  query: Record<string, string | number | undefined> = {},
) {
  const params = [`${keyName}=${keyValue}`];

  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'undefined' && value !== '') {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return `${baseUrl}?${params.join('&')}`;
}

function getFoodNutritionUrl(query: string) {
  return appendRawServiceKey(
    externalApiEndpoints.foodNutritionDb,
    'serviceKey',
    env.apiKeys.foodNutritionDb,
    {
      type: 'json',
      pageNo: 1,
      numOfRows: 50,
      FOOD_NM_KR: query,
    },
  );
}

function toNutritionEntries(row: FoodNutritionRow) {
  const serving = row.SERVING_SIZE ? `/${row.SERVING_SIZE}` : '';
  const entries = [
    { label: '열량', value: row.AMT_NUM1 ? `${Number(row.AMT_NUM1).toLocaleString('ko-KR')}kcal${serving}` : '' },
    { label: '탄수화물', value: row.AMT_NUM6 ? `${row.AMT_NUM6}g${serving}` : '' },
    { label: '단백질', value: row.AMT_NUM3 ? `${row.AMT_NUM3}g${serving}` : '' },
    { label: '지방', value: row.AMT_NUM4 ? `${row.AMT_NUM4}g${serving}` : '' },
    { label: '나트륨', value: row.AMT_NUM13 ? `${Number(row.AMT_NUM13).toLocaleString('ko-KR')}mg${serving}` : '' },
  ];

  return entries.filter((entry) => entry.value);
}

function getNutritionQueryConfigs(item: PriceItem) {
  const configured = nutritionQueries[item.id];
  if (configured) return [configured];

  if (!['farm', 'livestock', 'seafood', 'processed'].includes(item.categoryId)) {
    return [];
  }

  const searchText = [item.name, item.sourceProductName, ...item.keywords].filter(Boolean).join(' ');
  const matched = nutritionKeywordQueries.find((entry) => entry.pattern.test(searchText));
  if (matched) {
    return [{ query: matched.query, preferredNames: matched.preferredNames }];
  }

  const normalizedName = item.name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[0-9.,]+ ?(g|kg|ml|l|L|개입|개|캔|롤|봉|팩)/g, ' ')
    .replace(/[^\p{Script=Hangul}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2)
    .slice(-2);

  return normalizedName.map((query) => ({ query, preferredNames: [query] }));
}

function isLiveSourcedItem(item: PriceItem) {
  return item.source.includes('API');
}

function buildKamisRetailUrl(config: KamisItemConfig) {
  const range = getKamisDateRange();
  const url = new URL(externalApiEndpoints.kamisRetailDailyProduct);

  url.searchParams.set('p_cert_key', env.apiKeys.kamis);
  url.searchParams.set('p_cert_id', env.apiKeys.kamisCertId);
  url.searchParams.set('p_returntype', 'json');
  url.searchParams.set('p_startday', range.startday);
  url.searchParams.set('p_endday', range.endday);
  url.searchParams.set('p_countycode', DEFAULT_KAMIS_COUNTY_CODE);
  url.searchParams.set('p_convert_kg_yn', 'N');
  url.searchParams.set('p_itemcategorycode', config.itemcategorycode);
  url.searchParams.set('p_itemcode', config.itemcode);
  url.searchParams.set('p_kindcode', config.kindcode);

  if (config.productrankcode) {
    url.searchParams.set('p_productrankcode', config.productrankcode);
  }

  return url.toString();
}

function buildKamisCountyUrl() {
  const url = new URL(externalApiEndpoints.kamisDailyCounty);

  url.searchParams.set('p_cert_key', env.apiKeys.kamis);
  url.searchParams.set('p_cert_id', env.apiKeys.kamisCertId);
  url.searchParams.set('p_returntype', 'json');
  url.searchParams.set('p_countycode', DEFAULT_KAMIS_COUNTY_CODE);

  return url.toString();
}

async function fetchKamisRows(config: KamisItemConfig) {
  const json = JSON.parse(await fetchText(buildKamisRetailUrl(config))) as {
    data?: {
      error_code?: string;
      item?: KamisRetailRow | KamisRetailRow[];
    };
  };

  if (json.data?.error_code && json.data.error_code !== '000') {
    throw new Error(`KAMIS error ${json.data.error_code}`);
  }

  return toArray(json.data?.item).filter((row) => typeof toNumber(row.price) === 'number');
}

async function fetchKamisCountyRows() {
  const json = JSON.parse(await fetchText(buildKamisCountyUrl())) as {
    error_code?: string;
    price?: KamisCountyRow | KamisCountyRow[] | string;
  };

  if (json.error_code && json.error_code !== '000') {
    throw new Error(`KAMIS dailyCountyList error ${json.error_code}`);
  }

  return toArray(typeof json.price === 'string' ? undefined : json.price).filter(
    (row) => typeof toNumber(row.dpr1) === 'number',
  );
}

function applyKamisItem(items: PriceItem[], config: KamisItemConfig, rows: KamisRetailRow[]) {
  const item = items.find((entry) => entry.id === config.itemId);
  if (!item || rows.length === 0) return;

  const latestDate = rows.map(fromKamisDate).filter(Boolean).sort().at(-1);
  if (!latestDate) return;

  const latestRows = rows.filter((row) => fromKamisDate(row) === latestDate);
  const averageRow = latestRows.find((row) => row.countyname === '평균');
  const marketRows = latestRows.filter((row) => row.marketname);
  const marketPrices = marketRows
    .map((row) => ({ row, price: toNumber(row.price) }))
    .filter((entry): entry is { row: KamisRetailRow; price: number } => typeof entry.price === 'number');
  const avgPrice = toNumber(averageRow?.price) ?? average(marketPrices.map((entry) => entry.price));

  if (!avgPrice) return;

  const trend = rows
    .filter((row) => row.countyname === '평균')
    .map((row) => ({ date: fromKamisDate(row), price: toNumber(row.price) }))
    .filter((entry): entry is { date: string; price: number } => !!entry.date && typeof entry.price === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((entry) => entry.price);
  const baseTrend = trend.length >= 2 ? trend : [...item.trend.slice(0, -1), avgPrice].slice(-7);
  const firstPrice = baseTrend[0] || avgPrice;
  const changeRate7d = Number((((avgPrice - firstPrice) / firstPrice) * 100).toFixed(1));
  const monthlyAvgPrice = item.monthlyAvgPrice || average(baseTrend);
  const sellerPrices = marketPrices.length > 0 ? marketPrices : [{ row: averageRow ?? latestRows[0], price: avgPrice }];

  item.avgPrice = avgPrice;
  item.monthlyAvgPrice = monthlyAvgPrice;
  item.minPrice = Math.min(...sellerPrices.map((entry) => entry.price), avgPrice);
  item.maxPrice = Math.max(...sellerPrices.map((entry) => entry.price), avgPrice);
  item.changeRate7d = changeRate7d;
  item.changeRate30d = Number((((avgPrice - monthlyAvgPrice) / monthlyAvgPrice) * 100).toFixed(1));
  item.decision = getDecision(avgPrice, monthlyAvgPrice, changeRate7d);
  item.reason = getReason(item.decision);
  item.source = 'KAMIS 일별 품목별 소매 가격자료 API';
  item.updatedAt = latestDate;
  item.sourceProductName = config.sourceName;
  item.trend = baseTrend;
  item.sellers = sellerPrices.slice(0, 5).map(({ row, price }) => ({
    type: String(row.marketname ?? '').includes('유통') ? 'MART' : 'MARKET',
    name: row.marketname ?? `${row.countyname ?? 'KAMIS'} 평균`,
    price,
    distance: row.countyname ?? 'KAMIS',
  }));
}

function getKamisDisplayName(row: KamisCountyRow) {
  const productName = asText(row.productName || row.item_name).replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
  const unit = asText(row.unit);

  if (!unit || productName.includes(unit)) return productName;
  return `${productName} ${unit}`;
}

function shouldSkipKamisAutoItem(row: KamisCountyRow, existingNames: Set<string>) {
  const productName = asText(row.productName || row.item_name);
  const displayName = getKamisDisplayName(row);
  const normalized = displayName.replace(/\s+/g, '');

  if (existingNames.has(normalized)) return true;
  if (productName === '쌀/10kg' || productName === '파/대파') return true;

  return false;
}

function buildKamisAutoItems(rows: KamisCountyRow[], existingItems: PriceItem[]) {
  const existingNames = new Set(existingItems.map((item) => item.name.replace(/\s+/g, '')));
  const existingIds = new Set(existingItems.map((item) => item.id));
  const items: PriceItem[] = [];

  for (const row of rows) {
    const productNo = asText(row.productno);
    const currentPrice = toNumber(row.dpr1);
    const previousPrice = toNumber(row.dpr2);
    const monthlyPrice = toNumber(row.dpr3);
    const displayName = getKamisDisplayName(row);
    const itemId = safeItemId('kamis', `${productNo}_${displayName}`);

    if (!productNo || !displayName || !currentPrice || existingIds.has(itemId) || shouldSkipKamisAutoItem(row, existingNames)) {
      continue;
    }

    const sourceCategory = asText(row.category_name);
    const { categoryId, categoryName } = getKamisCategory(sourceCategory, displayName);
    const monthlyAvgPrice = monthlyPrice || currentPrice;
    const changeRate7d = previousPrice
      ? Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1))
      : Number(toNumber(row.value) ?? 0);
    const changeRate30d = monthlyAvgPrice
      ? Number((((currentPrice - monthlyAvgPrice) / monthlyAvgPrice) * 100).toFixed(1))
      : 0;
    const decision = getDecision(currentPrice, monthlyAvgPrice, changeRate7d);

    items.push({
      id: itemId,
      name: displayName,
      categoryId,
      categoryName,
      unit: asText(row.unit) || '1개',
      avgPrice: currentPrice,
      monthlyAvgPrice,
      minPrice: Math.min(currentPrice, previousPrice ?? currentPrice, monthlyAvgPrice),
      maxPrice: Math.max(currentPrice, previousPrice ?? currentPrice, monthlyAvgPrice),
      changeRate7d,
      changeRate30d,
      decision,
      reason: getReason(decision),
      source: 'KAMIS 최근일자 지역별 도·소매 가격 정보 API',
      updatedAt: asText(row.lastest_day) || formatDate(new Date()),
      sourceProductName: asText(row.productName || row.item_name),
      keywords: keywordTokens(displayName),
      trend: buildTrend(currentPrice, previousPrice, monthlyAvgPrice),
      sellers: [
        {
          type: 'MARKET',
          name: `${DEFAULT_KAMIS_COUNTY_CODE === '1101' ? '서울' : '지역'} 소매 평균`,
          price: currentPrice,
          distance: 'KAMIS',
        },
      ],
    });
    existingIds.add(itemId);
    existingNames.add(displayName.replace(/\s+/g, ''));
  }

  return items.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

async function applyKamisPrices(items: PriceItem[], diagnostics: string[]) {
  if (!isApiKeyConfigured('kamis')) {
    diagnostics.push('KAMIS key is not configured.');
    return;
  }

  const [countyResult] = await Promise.allSettled([
    fetchKamisCountyRows(),
    ...kamisItemConfigs.map(async (config) => {
      try {
        const rows = await fetchKamisRows(config);
        applyKamisItem(items, config, rows);
      } catch (error) {
        diagnostics.push(`KAMIS ${config.itemId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
  ]);

  if (countyResult.status === 'fulfilled') {
    items.push(...buildKamisAutoItems(countyResult.value, items));
  } else {
    diagnostics.push(`KAMIS dailyCountyList: ${countyResult.reason instanceof Error ? countyResult.reason.message : String(countyResult.reason)}`);
  }
}

function getConsumerPriceUrl(day: string, entpId: string) {
  return appendRawServiceKey(
    externalApiEndpoints.consumerProductPrice,
    'ServiceKey',
    env.apiKeys.consumerProductPrice,
    {
      goodInspectDay: day,
      entpId,
    },
  );
}

function getConsumerProductInfoUrl() {
  return appendRawServiceKey(
    externalApiEndpoints.consumerProductInfo,
    'ServiceKey',
    env.apiKeys.consumerProductPrice,
  );
}

function getConsumerStoreUrl() {
  return appendRawServiceKey(
    externalApiEndpoints.consumerStoreInfo,
    'ServiceKey',
    env.apiKeys.consumerProductPrice,
  );
}

async function fetchConsumerProductMap() {
  const xml = await fetchText(getConsumerProductInfoUrl());
  const parsed = xmlParser.parse(xml) as {
    response?: {
      result?: {
        item?: ConsumerProductRow | ConsumerProductRow[];
      };
    };
  };
  const rows = toArray(parsed.response?.result?.item);

  return new Map(
    rows
      .filter((row) => row.goodId && row.goodName)
      .map((row) => [String(row.goodId), row]),
  );
}

async function fetchConsumerStoreMap() {
  const xml = await fetchText(getConsumerStoreUrl());
  const parsed = xmlParser.parse(xml) as {
    response?: {
      result?: {
        'iros.openapi.service.vo.entpInfoVO'?: ConsumerStoreRow | ConsumerStoreRow[];
      };
    };
  };
  const rows = toArray(parsed.response?.result?.['iros.openapi.service.vo.entpInfoVO']);

  return new Map(
    rows
      .filter((row) => row.entpId && row.entpName)
      .map((row) => [
        String(row.entpId),
        {
          name: row.entpName ?? `판매점 ${row.entpId}`,
          type: row.entpTypeCode === 'SM' ? 'MARKET' : 'MART',
        },
      ]),
  );
}

async function fetchConsumerStores() {
  const xml = await fetchText(getConsumerStoreUrl());
  const parsed = xmlParser.parse(xml) as {
    response?: {
      result?: {
        'iros.openapi.service.vo.entpInfoVO'?: ConsumerStoreRow | ConsumerStoreRow[];
      };
    };
  };

  return toArray(parsed.response?.result?.['iros.openapi.service.vo.entpInfoVO']).filter((row) => row.entpId);
}

async function fetchConsumerRows(day: string, entpId: string) {
  const xml = await fetchText(getConsumerPriceUrl(day, entpId));
  const parsed = xmlParser.parse(xml) as {
    response?: {
      resultCode?: string | number;
      resultMsg?: string;
      result?: {
        'iros.openapi.service.vo.goodPriceVO'?: ConsumerPriceRow | ConsumerPriceRow[];
      };
    };
  };
  const resultCode = asText(parsed.response?.resultCode);
  const resultMsg = asText(parsed.response?.resultMsg);

  if (resultCode && resultCode !== '00') {
    throw new Error(resultMsg ? `Consumer product price API ${resultCode}: ${resultMsg}` : `Consumer product price API ${resultCode}`);
  }

  return toArray(parsed.response?.result?.['iros.openapi.service.vo.goodPriceVO']);
}

async function fetchConsumerRowsForStores(day: string, storeIds: string[]) {
  const rows: ConsumerPriceRow[] = [];

  for (let index = 0; index < storeIds.length; index += CONSUMER_PRICE_BATCH_SIZE) {
    const batch = storeIds.slice(index, index + CONSUMER_PRICE_BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(async (entpId) => ({
        entpId,
        rows: await fetchConsumerRows(day, entpId),
      })),
    );
    const failures = settled.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (failures.length === settled.length && failures.length > 0) {
      throw failures[0].reason;
    }

    rows.push(
      ...settled
        .filter((result): result is PromiseFulfilledResult<{ entpId: string; rows: ConsumerPriceRow[] }> =>
          result.status === 'fulfilled',
        )
        .flatMap((result) => result.value.rows.map((row) => ({ ...row, entpId: row.entpId ?? result.value.entpId }))),
    );
  }

  return rows;
}

function getConsumerDateCandidates() {
  return Array.from(
    new Set(
      [
        process.env.CONSUMER_PRICE_DATE?.trim(),
        previousFriday(),
        CONSUMER_FALLBACK_INSPECT_DAY,
      ].filter((value): value is string => !!value),
    ),
  );
}

async function fetchBestConsumerRows() {
  const stores = await fetchConsumerStores();
  const preferredStoreIds = new Set(consumerStoreIds);
  const storeIds = unique([
    ...consumerStoreIds,
    ...stores
      .filter((store) => !preferredStoreIds.has(String(store.entpId)))
      .slice(0, Math.max(CONSUMER_AUTO_STORE_LIMIT - consumerStoreIds.length, 0))
      .map((store) => String(store.entpId)),
  ]);

  for (const day of getConsumerDateCandidates()) {
    const rows = await fetchConsumerRowsForStores(day, storeIds);

    if (rows.length > 0) {
      return { day, rows };
    }
  }

  return { day: CONSUMER_FALLBACK_INSPECT_DAY, rows: [] };
}

function applyConsumerItem(
  items: PriceItem[],
  config: ConsumerGoodConfig,
  rows: ConsumerPriceRow[],
  storeMap: Map<string, { name: string; type: string }>,
  day: string,
) {
  const item = items.find((entry) => entry.id === config.itemId);
  if (!item) return;

  const goodNameById = new Map(config.goods.map((good) => [good.goodId, good.name]));
  const priceRows = rows
    .filter((row) => goodNameById.has(String(row.goodId)))
    .map((row) => ({
      goodId: String(row.goodId),
      entpId: String(row.entpId),
      price: toNumber(row.goodPrice),
    }))
    .filter((row): row is { goodId: string; entpId: string; price: number } => typeof row.price === 'number');

  if (priceRows.length === 0) return;

  const prices = priceRows.map((row) => row.price);
  const avgPrice = average(prices);
  const monthlyAvgPrice = item.monthlyAvgPrice || item.avgPrice;
  const trend = [...item.trend.slice(1), avgPrice];
  const firstPrice = trend[0] || avgPrice;
  const changeRate7d = Number((((avgPrice - firstPrice) / firstPrice) * 100).toFixed(1));

  item.avgPrice = avgPrice;
  item.monthlyAvgPrice = monthlyAvgPrice;
  item.minPrice = Math.min(...prices);
  item.maxPrice = Math.max(...prices);
  item.changeRate7d = changeRate7d;
  item.changeRate30d = Number((((avgPrice - monthlyAvgPrice) / monthlyAvgPrice) * 100).toFixed(1));
  item.decision = getDecision(avgPrice, monthlyAvgPrice, changeRate7d);
  item.reason = getReason(item.decision);
  item.source = '한국소비자원 생필품 가격 정보 API';
  item.updatedAt = compactDateToIso(day);
  item.sourceProductName = config.goods.map((good) => good.name).join(' / ');
  item.trend = trend;
  item.sellers = priceRows.slice(0, 6).map((row) => {
    const store = storeMap.get(row.entpId);

    return {
      type: (store?.type ?? 'MART') as SellerType,
      name: `${store?.name ?? `판매점 ${row.entpId}`} · ${goodNameById.get(row.goodId)}`,
      price: row.price,
      distance: undefined,
    };
  });
}

function buildConsumerAutoItems(
  productMap: Map<string, ConsumerProductRow>,
  rows: ConsumerPriceRow[],
  storeMap: Map<string, { name: string; type: string }>,
  day: string,
  existingIds: Set<string>,
) {
  const grouped = new Map<string, ConsumerPriceRow[]>();

  for (const row of rows) {
    const goodId = asText(row.goodId);
    const price = toNumber(row.goodPrice);

    if (!goodId || !price || curatedConsumerGoodIds.has(goodId)) continue;

    const product = productMap.get(goodId);
    if (!product?.goodName) continue;

    const list = grouped.get(goodId) ?? [];
    list.push(row);
    grouped.set(goodId, list);
  }

  const items: PriceItem[] = [];

  for (const [goodId, priceRows] of grouped.entries()) {
    const product = productMap.get(goodId);
    const name = asText(product?.goodName);
    const itemId = safeItemId('consumer_good', goodId);

    if (!product || !name || existingIds.has(itemId)) continue;

    const parsedRows = priceRows
      .map((row) => ({
        entpId: asText(row.entpId),
        price: toNumber(row.goodPrice),
      }))
      .filter((row): row is { entpId: string; price: number } => !!row.entpId && typeof row.price === 'number');

    if (parsedRows.length === 0) continue;

    const prices = parsedRows.map((row) => row.price);
    const avgPrice = average(prices);
    const { categoryId, categoryName } = getCategoryFromName(name);
    const unit = getConsumerUnit(product);

    items.push({
      id: itemId,
      name,
      categoryId,
      categoryName,
      unit,
      avgPrice,
      monthlyAvgPrice: avgPrice,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      changeRate7d: 0,
      changeRate30d: 0,
      decision: 'NEUTRAL',
      reason: '판매처별 가격을 모아 평균을 계산했습니다.',
      source: '한국소비자원 생필품 가격 정보 API',
      updatedAt: compactDateToIso(day),
      sourceProductName: name,
      keywords: keywordTokens(name),
      trend: buildTrend(avgPrice),
      sellers: parsedRows.slice(0, 6).map((row) => {
        const store = storeMap.get(row.entpId);

        return {
          type: (store?.type ?? 'MART') as SellerType,
          name: store?.name ?? `판매점 ${row.entpId}`,
          price: row.price,
          distance: undefined,
        };
      }),
    });
  }

  return items.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

async function applyConsumerPrices(items: PriceItem[], diagnostics: string[]) {
  if (!isApiKeyConfigured('consumerProductPrice')) {
    diagnostics.push('Consumer product price key is not configured.');
    return;
  }

  try {
    const [productMap, storeMapResult, priceResult] = await Promise.all([
      fetchConsumerProductMap(),
      fetchConsumerStoreMap().catch(() => new Map<string, { name: string; type: string }>()),
      fetchBestConsumerRows(),
    ]);
    const storeMap = storeMapResult;
    diagnostics.push(
      `Consumer product price collected ${priceResult.rows.length} price rows for ${productMap.size} products on ${priceResult.day}.`,
    );

    for (const config of consumerGoodConfigs) {
      applyConsumerItem(items, config, priceResult.rows, storeMap, priceResult.day);
    }

    const dynamicItems = buildConsumerAutoItems(
      productMap,
      priceResult.rows,
      storeMap,
      priceResult.day,
      new Set(items.map((item) => item.id)),
    );
    diagnostics.push(`Consumer product price generated ${dynamicItems.length} auto items.`);
    items.push(...dynamicItems);
  } catch (error) {
    diagnostics.push(`Consumer product price: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getLivePriceItems() {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.items;
  }

  if (inFlightItems) {
    return inFlightItems;
  }

  inFlightItems = collectLivePriceItems().finally(() => {
    inFlightItems = undefined;
  });

  return inFlightItems;
}

async function collectLivePriceItems() {
  const items = cloneItems(priceItems);
  const diagnostics: string[] = [];

  await Promise.all([
    applyKamisPrices(items, diagnostics),
    applyConsumerPrices(items, diagnostics),
  ]);
  const hasPartialConsumerCollection = diagnostics.some(
    (message) =>
      message.startsWith('Consumer product price:') ||
      message.includes('generated 0 auto items'),
  );

  const liveItems = items.filter(isLiveSourcedItem);
  if (liveItems.length < items.length) {
    diagnostics.push(`Removed ${items.length - liveItems.length} seed items without live source updates.`);
  }

  cache = {
    expiresAt: Date.now() + (hasPartialConsumerCollection ? PARTIAL_CACHE_TTL_MS : CACHE_TTL_MS),
    items: liveItems,
    diagnostics,
  };

  return liveItems;
}

export function getLiveDataDiagnostics() {
  return cache?.diagnostics ?? [];
}

export async function getLiveNutrition(item: PriceItem) {
  const fallback = item.nutrition ?? [];
  const cached = nutritionCache.get(item.id);
  if (cached) return cached;

  const configs = getNutritionQueryConfigs(item);
  if (configs.length === 0 || !isApiKeyConfigured('foodNutritionDb')) {
    return fallback;
  }

  for (const config of configs) {
    try {
      const json = JSON.parse(await fetchText(getFoodNutritionUrl(config.query), NUTRITION_REQUEST_TIMEOUT_MS)) as {
        body?: {
          items?: FoodNutritionRow[];
        };
      };
      const rows = json.body?.items ?? [];
      const selected =
        rows.find((row) => config.preferredNames.includes(String(row.FOOD_NM_KR))) ??
        rows.find((row) => String(row.FOOD_NM_KR).includes(config.query)) ??
        rows[0];
      const nutrition = selected ? toNutritionEntries(selected) : [];

      if (nutrition.length > 0) {
        nutritionCache.set(item.id, nutrition);
        return nutrition;
      }
    } catch {
      // Try the next normalized query before falling back to local nutrition.
    }
  }

  return fallback;
}

export function clearLiveDataCache() {
  cache = undefined;
  nutritionCache.clear();
}
