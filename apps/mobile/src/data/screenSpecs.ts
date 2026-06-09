export type ScreenKind =
  | 'priceSummary'
  | 'recommendations'
  | 'priceChanges'
  | 'recentItems'
  | 'searchResults'
  | 'searchEmpty'
  | 'categories'
  | 'categoryItems'
  | 'filter'
  | 'itemDetail'
  | 'itemBasic'
  | 'itemPrices'
  | 'priceTrend'
  | 'sellerPrices'
  | 'itemDecision'
  | 'buyDecision'
  | 'waitDecision'
  | 'alternatives'
  | 'compareSelect'
  | 'compareResult'
  | 'compareRegions'
  | 'compareStores'
  | 'shoppingEdit'
  | 'shoppingBudget'
  | 'shoppingComplete'
  | 'purchaseHistory'
  | 'alertEdit'
  | 'alertHistory'
  | 'settings';

export type ScreenSpec = {
  screenNo: number;
  routeName: string;
  title: string;
  routePath: string;
  tab: string;
  api: string;
  state: string;
  notes: string[];
  kind: ScreenKind;
  requiresPublicApiKey?: boolean;
};

export const screenSpecs: ScreenSpec[] = [
  {
    screenNo: 4,
    routeName: 'PriceSummary',
    title: '물가 요약',
    routePath: '/home/price-summary',
    tab: '홈',
    api: 'GET /prices/summary',
    state: 'period,category,summary',
    notes: ['주간/월간 필터', '상승/하락 Top 노출', '데이터 갱신시각 표시'],
    kind: 'priceSummary',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 5,
    routeName: 'Recommendations',
    title: '추천 구매',
    routePath: '/home/recommendations',
    tab: '홈',
    api: 'GET /recommendations',
    state: 'decisionType,itemList',
    notes: ['BUY/WAIT/REPLACE 탭', '개인 설정 기반', '상세로 이동'],
    kind: 'recommendations',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 6,
    routeName: 'PriceChanges',
    title: '가격 변동 품목',
    routePath: '/home/price-changes',
    tab: '홈',
    api: 'GET /prices/changes',
    state: 'changeRate,period',
    notes: ['상승/하락 필터', '변동률 정렬', '품목 상세 연결'],
    kind: 'priceChanges',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 7,
    routeName: 'RecentItems',
    title: '최근 본 품목',
    routePath: '/home/recent-items',
    tab: '홈',
    api: 'GET /users/recent-items',
    state: 'recentItems',
    notes: ['로컬+서버 동기화', '삭제 가능', '빈 상태 필요'],
    kind: 'recentItems',
  },
  {
    screenNo: 9,
    routeName: 'SearchResults',
    title: '검색 결과',
    routePath: '/search/results',
    tab: '검색',
    api: 'GET /items/search?q=',
    state: 'keyword,results,sort',
    notes: ['정렬/필터 연결', '무한스크롤 또는 페이지', '품목 상세 이동'],
    kind: 'searchResults',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 10,
    routeName: 'SearchEmpty',
    title: '검색 결과 없음',
    routePath: '/search/empty',
    tab: '검색',
    api: 'GET /items/search?q=',
    state: 'emptyKeyword',
    notes: ['추천 검색어 제공', '검색어 수정 CTA', '오류와 분리'],
    kind: 'searchEmpty',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 11,
    routeName: 'Categories',
    title: '카테고리',
    routePath: '/categories',
    tab: '검색',
    api: 'GET /categories',
    state: 'categories',
    notes: ['대분류 6개', '인기 품목 영역', '카테고리 목록 이동'],
    kind: 'categories',
  },
  {
    screenNo: 12,
    routeName: 'CategoryItems',
    title: '카테고리 품목 목록',
    routePath: '/categories/:categoryId/items',
    tab: '검색',
    api: 'GET /categories/{id}/items',
    state: 'categoryId,items',
    notes: ['카테고리별 품목', '정렬/필터', '품목 상세 이동'],
    kind: 'categoryItems',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 13,
    routeName: 'ItemFilter',
    title: '필터/정렬',
    routePath: '/items/filter',
    tab: '검색',
    api: 'client state',
    state: 'category,priceRange,sort',
    notes: ['바텀시트로 구현 가능', '적용/초기화', '검색·목록 공통'],
    kind: 'filter',
  },
  {
    screenNo: 14,
    routeName: 'ItemDetail',
    title: '품목 상세 개요',
    routePath: '/items/:itemId',
    tab: '검색',
    api: 'GET /items/{id}/detail',
    state: 'itemId,overview',
    notes: ['평균가/판단/CTA', '최근 본 품목 저장', '하위 상세 탭 연결'],
    kind: 'itemDetail',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 15,
    routeName: 'ItemBasic',
    title: '품목 기본 정보',
    routePath: '/items/:itemId/basic',
    tab: '검색',
    api: 'GET /items/{id}/basic',
    state: 'itemMeta,nutrition',
    notes: ['단위/규격/카테고리', '영양정보 선택 노출', 'API 출처 표시'],
    kind: 'itemBasic',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 16,
    routeName: 'ItemPrices',
    title: '품목 가격 정보',
    routePath: '/items/:itemId/prices',
    tab: '검색',
    api: 'GET /items/{id}/prices',
    state: 'avg,min,max,stores',
    notes: ['현재가/평균/최저/최고', '판매처 요약', '지역 설정 반영'],
    kind: 'itemPrices',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 17,
    routeName: 'PriceTrend',
    title: '가격 추이 상세',
    routePath: '/items/:itemId/trend',
    tab: '검색',
    api: 'GET /items/{id}/trend',
    state: 'period,priceSeries',
    notes: ['7/30/90일 필터', '차트 터치 영역', '전주/전월 비교'],
    kind: 'priceTrend',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 18,
    routeName: 'SellerPrices',
    title: '판매처별 가격',
    routePath: '/items/:itemId/sellers',
    tab: '검색',
    api: 'GET /items/{id}/sellers',
    state: 'sellerPrices',
    notes: ['마트/시장/온라인 분류', '거리/가격 정렬', '데이터 기준 고지'],
    kind: 'sellerPrices',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 19,
    routeName: 'ItemDecision',
    title: '구매 판단',
    routePath: '/items/:itemId/decision',
    tab: '검색',
    api: 'GET /items/{id}/decision',
    state: 'decision,reason',
    notes: ['BUY/WAIT/REPLACE', '판단 근거 투명화', '장보기/알림 CTA'],
    kind: 'itemDecision',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 20,
    routeName: 'BuyDecision',
    title: '지금 사기 상세',
    routePath: '/decisions/buy',
    tab: '홈',
    api: 'GET /recommendations?type=BUY',
    state: 'buyItems',
    notes: ['사기 좋은 품목 목록', '근거 요약', '장보기 추가'],
    kind: 'buyDecision',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 21,
    routeName: 'WaitDecision',
    title: '기다리기 상세',
    routePath: '/decisions/wait',
    tab: '홈',
    api: 'GET /recommendations?type=WAIT',
    state: 'waitItems',
    notes: ['목표가 추천', '가격 알림 생성 CTA', '예상 하락 근거'],
    kind: 'waitDecision',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 22,
    routeName: 'Alternatives',
    title: '대체 품목 추천',
    routePath: '/decisions/alternatives',
    tab: '홈',
    api: 'GET /items/{id}/alternatives',
    state: 'alternatives',
    notes: ['유사 품목 비교', '가격 차이 표시', '대체품 상세 이동'],
    kind: 'alternatives',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 23,
    routeName: 'CompareSelect',
    title: '가격 비교 선택',
    routePath: '/compare/select',
    tab: '검색',
    api: 'GET /items/search',
    state: 'itemA,itemB',
    notes: ['2개 이상 선택 제한', '검색으로 품목 추가', '비교 결과 이동'],
    kind: 'compareSelect',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 24,
    routeName: 'CompareResult',
    title: '가격 비교 결과',
    routePath: '/compare/result',
    tab: '검색',
    api: 'GET /compare/items',
    state: 'compareResult',
    notes: ['평균가/추세/판단 비교', '우위 품목 강조', '장보기 추가'],
    kind: 'compareResult',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 25,
    routeName: 'CompareRegions',
    title: '지역별 비교',
    routePath: '/compare/regions',
    tab: '검색',
    api: 'GET /compare/regions',
    state: 'regions,itemId',
    notes: ['내 지역 vs 전국', '시군구 선택', '지역 기준 명시'],
    kind: 'compareRegions',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 26,
    routeName: 'CompareStores',
    title: '판매처별 비교',
    routePath: '/compare/stores',
    tab: '검색',
    api: 'GET /compare/stores',
    state: 'stores,itemId',
    notes: ['마트/시장/온라인', '최저가 정렬', '판매처 상세 링크'],
    kind: 'compareStores',
    requiresPublicApiKey: true,
  },
  {
    screenNo: 28,
    routeName: 'ShoppingEdit',
    title: '장보기 품목 추가/수정',
    routePath: '/shopping/edit/:id?',
    tab: '목록',
    api: 'POST/PATCH /shopping-list/items',
    state: 'name,qty,price,memo',
    notes: ['직접 추가/검색 추가 공통', '필수값 검증', '저장 후 목록 갱신'],
    kind: 'shoppingEdit',
  },
  {
    screenNo: 29,
    routeName: 'ShoppingBudget',
    title: '예산 요약',
    routePath: '/shopping/budget',
    tab: '목록',
    api: 'GET /shopping-list/budget',
    state: 'budget,total,remaining',
    notes: ['주간/월간 예산 대비 지출', '초과 경고', '예산 설정 연결'],
    kind: 'shoppingBudget',
  },
  {
    screenNo: 30,
    routeName: 'ShoppingComplete',
    title: '구매 완료',
    routePath: '/shopping/complete',
    tab: '목록',
    api: 'POST /purchases',
    state: 'completedItems',
    notes: ['체크 품목 구매 처리', '구매 이력 저장', '목록에서 제거 옵션'],
    kind: 'shoppingComplete',
  },
  {
    screenNo: 31,
    routeName: 'PurchaseHistory',
    title: '구매 이력',
    routePath: '/shopping/history',
    tab: '목록',
    api: 'GET /purchases/history',
    state: 'history,month',
    notes: ['월별 필터', '재구매 버튼', '소비 패턴 분석 확장'],
    kind: 'purchaseHistory',
  },
  {
    screenNo: 33,
    routeName: 'AlertEdit',
    title: '가격 알림 생성/수정',
    routePath: '/alerts/edit/:id?',
    tab: '알림',
    api: 'POST/PATCH /alerts',
    state: 'item,targetPrice,condition',
    notes: ['목표가 필수', '중복 알림 방지', '푸시 권한 확인'],
    kind: 'alertEdit',
  },
  {
    screenNo: 34,
    routeName: 'AlertHistory',
    title: '알림 이력',
    routePath: '/alerts/history',
    tab: '알림',
    api: 'GET /alerts/history',
    state: 'history',
    notes: ['읽음/안읽음', '품목 상세 이동', '전체 읽음 처리'],
    kind: 'alertHistory',
  },
  {
    screenNo: 36,
    routeName: 'Settings',
    title: '설정/데이터 출처',
    routePath: '/settings',
    tab: 'MY',
    api: 'GET /data-sources',
    state: 'settings,sources',
    notes: ['지역/예산/알림 설정', 'API 출처 고지', '약관/개인정보'],
    kind: 'settings',
    requiresPublicApiKey: true,
  },
];

export function getSpec(routeName: string) {
  return screenSpecs.find((spec) => spec.routeName === routeName);
}
