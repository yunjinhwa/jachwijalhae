export type CsvSourceFile = {
  id: string;
  name: string;
  path: string;
  encoding: string;
  rowCount: number;
  latestDate: string;
  columns: string[];
};

export type CsvPriceSeed = {
  itemId: string;
  displayName: string;
  sourceProductName: string;
  unit: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  sourceName: string;
  sourceFileId: string;
  observedAt: string;
  sellerSummary: Array<{
    type: 'MART' | 'MARKET' | 'ONLINE' | 'RETAIL';
    name: string;
    price: number;
    distance?: string;
  }>;
};

export const sourceCsvFiles: CsvSourceFile[] = [
  {
    id: 'kamis_daily_wholesale_retail_20240930',
    name: '한국농수산식품유통공사_농축수산물 일자별 도소매 가격_20240930.csv',
    path: '데이터_파일/한국농수산식품유통공사_농축수산물 일자별 도소매 가격_20240930.csv',
    encoding: 'CP949',
    rowCount: 990281,
    latestDate: '2024-09-30',
    columns: [
      '가격등록일자',
      '시장명',
      '시도명',
      '시군구명',
      '품목명',
      '품종명',
      '조사구분명',
      '산물등급명',
      '품목가격',
      '소매출하단위크기',
      '소매출하단위명',
    ],
  },
  {
    id: 'consumer_product_price_stats_20241220',
    name: '한국소비자원_생필품 가격 정보 상품별 통계_20241220.csv',
    path: '데이터_파일/한국소비자원_생필품 가격 정보 상품별 통계_20241220.csv',
    encoding: 'CP949',
    rowCount: 42067,
    latestDate: '2024-12-20',
    columns: ['조사일', '상품명', '평균판매가격'],
  },
];

export const csvPriceSeeds: CsvPriceSeed[] = [
  {
    itemId: 'item_egg_30',
    displayName: '달걀 15개',
    sourceProductName: '목초를 먹고 자란 건강한 닭이 낳은 달걀(대란 15개)',
    unit: '15개',
    avgPrice: 8482,
    minPrice: 6500,
    maxPrice: 8482,
    sourceName: '한국소비자원 상품별 통계 CSV + KAMIS 부산 친환경 계란 표본',
    sourceFileId: 'consumer_product_price_stats_20241220',
    observedAt: '2024-12-20',
    sellerSummary: [
      { type: 'MART', name: '소비자원 전국 평균', price: 8482 },
      { type: 'MART', name: '부산 대형마트 표본', price: 7980, distance: '부산' },
      { type: 'MARKET', name: '부산 전문점 표본', price: 6500, distance: '부산' },
    ],
  },
  {
    itemId: 'item_rice_10',
    displayName: '쌀 10kg',
    sourceProductName: '쌀 10kg / 쌀 10kg(햅쌀)',
    unit: '10kg',
    avgPrice: 28550,
    minPrice: 25900,
    maxPrice: 32900,
    sourceName: 'KAMIS 일자별 도소매 가격 CSV 부산 소매 표본',
    sourceFileId: 'kamis_daily_wholesale_retail_20240930',
    observedAt: '2024-09-30',
    sellerSummary: [
      { type: 'MARKET', name: '부전시장', price: 29000, distance: '부산' },
      { type: 'MART', name: 'A-유통 부산', price: 25900, distance: '부산' },
      { type: 'MART', name: 'H-유통 부산', price: 26800, distance: '부산' },
    ],
  },
  {
    itemId: 'item_milk_1',
    displayName: '서울우유 흰우유 1L',
    sourceProductName: '서울우유 흰우유(1L)',
    unit: '1L',
    avgPrice: 3120,
    minPrice: 2863,
    maxPrice: 3869,
    sourceName: '한국소비자원 상품별 통계 CSV',
    sourceFileId: 'consumer_product_price_stats_20241220',
    observedAt: '2024-12-20',
    sellerSummary: [
      { type: 'MART', name: '서울우유 흰우유(1L)', price: 3120 },
      { type: 'MART', name: '덴마크 대니쉬우유 오리지널(900ml)', price: 2863 },
      { type: 'MART', name: '매일 소화가 잘되는 우유(930ml)', price: 3869 },
    ],
  },
  {
    itemId: 'item_detergent',
    displayName: '스파크 분말세제 3kg',
    sourceProductName: '스파크 분말세제(3kg)',
    unit: '3kg',
    avgPrice: 11850,
    minPrice: 4378,
    maxPrice: 16900,
    sourceName: '한국소비자원 상품별 통계 CSV',
    sourceFileId: 'consumer_product_price_stats_20241220',
    observedAt: '2024-12-20',
    sellerSummary: [
      { type: 'MART', name: '스파크 분말세제(3kg)', price: 11850 },
      { type: 'MART', name: '때가 쏙 비트 분말세제(6kg)', price: 16900 },
      { type: 'MART', name: '홈스타 락스와세제 후로랄파인(750ml)', price: 4378 },
    ],
  },
  {
    itemId: 'item_tuna',
    displayName: '동원참치 4캔',
    sourceProductName: '동원참치 라이트스탠다드(4캔)',
    unit: '4캔',
    avgPrice: 9541,
    minPrice: 3402,
    maxPrice: 9541,
    sourceName: '한국소비자원 상품별 통계 CSV',
    sourceFileId: 'consumer_product_price_stats_20241220',
    observedAt: '2024-12-20',
    sellerSummary: [
      { type: 'MART', name: '동원참치 라이트스탠다드(4캔)', price: 9541 },
      { type: 'MART', name: '사조참치 살코기 안심따개(4캔)', price: 9012 },
      { type: 'MART', name: '동원참치 라이트스탠다드(150g)', price: 3402 },
    ],
  },
  {
    itemId: 'item_tissue',
    displayName: '화장지 30롤',
    sourceProductName: '깨끗한나라 순수 시그니쳐 3겹(30롤)',
    unit: '30롤',
    avgPrice: 18900,
    minPrice: 18900,
    maxPrice: 32061,
    sourceName: '한국소비자원 상품별 통계 CSV',
    sourceFileId: 'consumer_product_price_stats_20241220',
    observedAt: '2024-12-20',
    sellerSummary: [
      { type: 'MART', name: '깨끗한나라 순수 시그니쳐 3겹(30롤)', price: 18900 },
      { type: 'MART', name: '코디 순백 3겹(30롤)', price: 22400 },
      { type: 'MART', name: '크리넥스 울트라클린 3겹(30롤)', price: 32061 },
    ],
  },
  {
    itemId: 'item_ramen',
    displayName: '라면 5개입',
    sourceProductName: '신라면/삼양라면/진라면 5개입',
    unit: '5개입',
    avgPrice: 4053,
    minPrice: 3848,
    maxPrice: 5240,
    sourceName: '한국소비자원 상품별 통계 CSV',
    sourceFileId: 'consumer_product_price_stats_20241220',
    observedAt: '2024-12-20',
    sellerSummary: [
      { type: 'MART', name: '삼양라면(5개입)', price: 4053 },
      { type: 'MART', name: '진라면 매운맛(5개입)', price: 3848 },
      { type: 'MART', name: '맛있는라면(5개입)', price: 5240 },
    ],
  },
  {
    itemId: 'item_green_onion',
    displayName: '대파 1kg',
    sourceProductName: '파 / 대파',
    unit: '1kg',
    avgPrice: 4650,
    minPrice: 2730,
    maxPrice: 5730,
    sourceName: 'KAMIS 일자별 도소매 가격 CSV 부산 소매 표본',
    sourceFileId: 'kamis_daily_wholesale_retail_20240930',
    observedAt: '2024-09-30',
    sellerSummary: [
      { type: 'MARKET', name: '부전시장', price: 2730, distance: '부산' },
      { type: 'MART', name: 'A-유통 부산', price: 4690, distance: '부산' },
      { type: 'MART', name: 'D-유통 부산', price: 5730, distance: '부산' },
    ],
  },
];

export const csvPriceSeedByItemId = Object.fromEntries(
  csvPriceSeeds.map((seed) => [seed.itemId, seed]),
) as Record<string, CsvPriceSeed>;
