export type Decision = 'BUY' | 'WAIT' | 'REPLACE' | 'NEUTRAL';

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type SellerType = 'MART' | 'MARKET' | 'ONLINE' | 'RETAIL';

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
    type: SellerType;
    name: string;
    price: number;
    distance?: string;
  }>;
  nutrition?: Array<{ label: string; value: string }>;
};

export const categories: Category[] = [
  { id: 'daily', name: '생필품', description: '휴지, 세제, 샴푸 등 생활용품' },
  { id: 'farm', name: '농산물', description: '채소, 과일, 곡류' },
  { id: 'livestock', name: '축산물', description: '계란, 닭고기, 돼지고기, 소고기' },
  { id: 'seafood', name: '수산물', description: '생선, 해산물, 건어물' },
  { id: 'processed', name: '가공식품', description: '라면, 즉석식품, 조미료' },
  { id: 'personal', name: '개인위생', description: '치약, 비누, 여성용품' },
];

export const priceItems: PriceItem[] = [
  {
    id: 'item_egg_30',
    name: '달걀 15개',
    categoryId: 'livestock',
    categoryName: '축산물',
    unit: '15개',
    avgPrice: 8482,
    monthlyAvgPrice: 8835,
    minPrice: 6500,
    maxPrice: 8482,
    changeRate7d: -8,
    changeRate30d: -4,
    decision: 'BUY',
    reason: '30일 평균보다 낮고 최근 가격 흐름이 안정적입니다.',
    source: '한국소비자원 상품별 통계 CSV + KAMIS 부산 친환경 계란 표본',
    updatedAt: '2024-12-20',
    sourceFileId: 'consumer_product_price_stats_20241220',
    sourceProductName: '목초를 먹고 자란 건강한 닭이 낳은 달걀(대란 15개)',
    keywords: ['계란', '달걀', 'egg'],
    trend: [9437, 9232, 9095, 8890, 8753, 8589, 8482],
    sellers: [
      { type: 'MART', name: '소비자원 전국 평균', price: 8482 },
      { type: 'MART', name: '부산 대형마트 표본', price: 7980, distance: '부산' },
      { type: 'MARKET', name: '부산 전문점 표본', price: 6500, distance: '부산' },
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
    avgPrice: 28550,
    monthlyAvgPrice: 28100,
    minPrice: 25900,
    maxPrice: 32900,
    changeRate7d: -2.1,
    changeRate30d: 1.6,
    decision: 'BUY',
    reason: '최근 평균가 대비 낮고 변동성이 낮습니다.',
    source: 'KAMIS 일자별 도소매 가격 CSV 부산 소매 표본',
    updatedAt: '2024-09-30',
    sourceFileId: 'kamis_daily_wholesale_retail_20240930',
    sourceProductName: '쌀 10kg / 쌀 10kg(햅쌀)',
    keywords: ['쌀', '백미', 'rice'],
    trend: [29735, 29538, 29242, 28945, 28748, 28649, 28550],
    sellers: [
      { type: 'MARKET', name: '부전시장', price: 29000, distance: '부산' },
      { type: 'MART', name: 'A-유통 부산', price: 25900, distance: '부산' },
      { type: 'MART', name: 'H-유통 부산', price: 26800, distance: '부산' },
    ],
  },
  {
    id: 'item_milk_1',
    name: '서울우유 흰우유 1L',
    categoryId: 'processed',
    categoryName: '가공식품',
    unit: '1L',
    avgPrice: 3120,
    monthlyAvgPrice: 3095,
    minPrice: 2863,
    maxPrice: 3869,
    changeRate7d: 0.4,
    changeRate30d: 0.8,
    decision: 'NEUTRAL',
    reason: '가격이 평균 수준입니다. 필요하면 구매하세요.',
    source: '한국소비자원 상품별 통계 CSV',
    updatedAt: '2024-12-20',
    sourceFileId: 'consumer_product_price_stats_20241220',
    sourceProductName: '서울우유 흰우유(1L)',
    keywords: ['우유', 'milk'],
    trend: [3083, 3110, 3120, 3110, 3133, 3120, 3120],
    sellers: [
      { type: 'MART', name: '서울우유 흰우유(1L)', price: 3120 },
      { type: 'MART', name: '덴마크 대니쉬우유 오리지널(900ml)', price: 2863 },
      { type: 'MART', name: '매일 소화가 잘되는 우유(930ml)', price: 3869 },
    ],
    nutrition: [
      { label: '열량', value: '130kcal/200ml' },
      { label: '칼슘', value: '210mg/200ml' },
    ],
  },
  {
    id: 'item_detergent',
    name: '스파크 분말세제 3kg',
    categoryId: 'daily',
    categoryName: '생필품',
    unit: '3kg',
    avgPrice: 11850,
    monthlyAvgPrice: 11013,
    minPrice: 4378,
    maxPrice: 16900,
    changeRate7d: 9.4,
    changeRate30d: 7.6,
    decision: 'WAIT',
    reason: '최근 평균보다 높거나 상승 흐름입니다. 목표가 알림을 설정해보세요.',
    source: '한국소비자원 상품별 통계 CSV',
    updatedAt: '2024-12-20',
    sourceFileId: 'consumer_product_price_stats_20241220',
    sourceProductName: '스파크 분말세제(3kg)',
    keywords: ['세제', '세탁세제', 'detergent'],
    trend: [10713, 10795, 10958, 11366, 11611, 11768, 11850],
    sellers: [
      { type: 'MART', name: '스파크 분말세제(3kg)', price: 11850 },
      { type: 'MART', name: '때가 쏙 비트 분말세제(6kg)', price: 16900 },
      { type: 'MART', name: '홈스타 락스와세제 후로랄파인(750ml)', price: 4378 },
    ],
  },
  {
    id: 'item_tuna',
    name: '동원참치 4캔',
    categoryId: 'processed',
    categoryName: '가공식품',
    unit: '4캔',
    avgPrice: 9541,
    monthlyAvgPrice: 9254,
    minPrice: 3402,
    maxPrice: 9541,
    changeRate7d: 2,
    changeRate30d: 3.1,
    decision: 'REPLACE',
    reason: '비슷한 품목 중 더 저렴한 대체 품목이 있습니다.',
    source: '한국소비자원 상품별 통계 CSV',
    updatedAt: '2024-12-20',
    sourceFileId: 'consumer_product_price_stats_20241220',
    sourceProductName: '동원참치 라이트스탠다드(4캔)',
    keywords: ['참치', '참치캔', 'tuna'],
    trend: [9223, 9302, 9461, 9541, 9621, 9581, 9541],
    sellers: [
      { type: 'MART', name: '동원참치 라이트스탠다드(4캔)', price: 9541 },
      { type: 'MART', name: '사조참치 살코기 안심따개(4캔)', price: 9012 },
      { type: 'MART', name: '동원참치 라이트스탠다드(150g)', price: 3402 },
    ],
  },
  {
    id: 'item_tissue',
    name: '화장지 30롤',
    categoryId: 'daily',
    categoryName: '생필품',
    unit: '30롤',
    avgPrice: 18900,
    monthlyAvgPrice: 19246,
    minPrice: 18900,
    maxPrice: 32061,
    changeRate7d: -3.3,
    changeRate30d: -1.8,
    decision: 'BUY',
    reason: '월평균보다 낮고 최저 표본 가격이 확인됩니다.',
    source: '한국소비자원 상품별 통계 CSV',
    updatedAt: '2024-12-20',
    sourceFileId: 'consumer_product_price_stats_20241220',
    sourceProductName: '깨끗한나라 순수 시그니쳐 3겹(30롤)',
    keywords: ['휴지', '화장지', 'tissue'],
    trend: [19969, 19731, 19494, 19256, 19019, 18900, 18900],
    sellers: [
      { type: 'MART', name: '깨끗한나라 순수 시그니쳐 3겹(30롤)', price: 18900 },
      { type: 'MART', name: '코디 순백 3겹(30롤)', price: 22400 },
      { type: 'MART', name: '크리넥스 울트라클린 3겹(30롤)', price: 32061 },
    ],
  },
  {
    id: 'item_ramen',
    name: '라면 5개입',
    categoryId: 'processed',
    categoryName: '가공식품',
    unit: '5개입',
    avgPrice: 4053,
    monthlyAvgPrice: 3845,
    minPrice: 3848,
    maxPrice: 5240,
    changeRate7d: 3.2,
    changeRate30d: 5.4,
    decision: 'WAIT',
    reason: '전주 대비 상승했습니다. 행사 가격을 기다려보세요.',
    source: '한국소비자원 상품별 통계 CSV',
    updatedAt: '2024-12-20',
    sourceFileId: 'consumer_product_price_stats_20241220',
    sourceProductName: '신라면/삼양라면/진라면 5개입',
    keywords: ['라면', 'ramen'],
    trend: [3841, 3879, 3937, 3957, 4005, 4034, 4053],
    sellers: [
      { type: 'MART', name: '삼양라면(5개입)', price: 4053 },
      { type: 'MART', name: '진라면 매운맛(5개입)', price: 3848 },
      { type: 'MART', name: '맛있는라면(5개입)', price: 5240 },
    ],
  },
  {
    id: 'item_green_onion',
    name: '대파 1kg',
    categoryId: 'farm',
    categoryName: '농산물',
    unit: '1kg',
    avgPrice: 4650,
    monthlyAvgPrice: 5290,
    minPrice: 2730,
    maxPrice: 5730,
    changeRate7d: -9.8,
    changeRate30d: -12.1,
    decision: 'BUY',
    reason: '최근 하락폭이 크고 지역 평균가가 낮습니다.',
    source: 'KAMIS 일자별 도소매 가격 CSV 부산 소매 표본',
    updatedAt: '2024-09-30',
    sourceFileId: 'kamis_daily_wholesale_retail_20240930',
    sourceProductName: '파 / 대파',
    keywords: ['대파', '파', 'green onion'],
    trend: [5646, 5479, 5281, 5066, 4900, 4749, 4650],
    sellers: [
      { type: 'MARKET', name: '부전시장', price: 2730, distance: '부산' },
      { type: 'MART', name: 'A-유통 부산', price: 4690, distance: '부산' },
      { type: 'MART', name: 'D-유통 부산', price: 5730, distance: '부산' },
    ],
  },
];
