import { ApiKeySlotId, isApiKeyConfigured } from './env.js';

export const API_BASE_PATH = '/v1';

export const externalApiEndpoints = {
  foodNutritionDb: 'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02',
  consumerProductPrice: 'https://openapi.price.go.kr/openApiImpl/ProductPriceInfoService',
  kamisProductInfo: 'http://www.kamis.or.kr/service/price/xml.do?action=productInfo',
  kamisRetailDailyProduct: 'http://www.kamis.or.kr/service/price/xml.do?action=periodRetailProductList',
  kamisDailyCounty: 'http://www.kamis.or.kr/service/price/xml.do?action=dailyCountyList',
  kamisRegionalItem: 'http://www.kamis.or.kr/service/price/xml.do?action=ItemInfo',
} as const;

export type ExternalApiEndpoint = {
  label: string;
  url: string;
  keySlotId: ApiKeySlotId;
};

export type PublicDataSource = {
  name: string;
  purpose: string;
  endpoints: ExternalApiEndpoint[];
};

export const apiKeySlots: Array<{
  id: ApiKeySlotId;
  label: string;
  envVarName: string;
  description: string;
}> = [
  {
    id: 'kamis',
    label: 'KAMIS 통합 API 키',
    envVarName: 'KAMIS_API_KEY',
    description: 'KAMIS 품목 코드, 소매가, 지역별 가격 API 4개가 하나의 키를 공유합니다.',
  },
  {
    id: 'foodNutritionDb',
    label: '식품영양성분DB정보 API 키',
    envVarName: 'FOOD_NUTRITION_DB_API_KEY',
    description: '식품영양성분DB정보 API 전용 서버 키입니다.',
  },
  {
    id: 'consumerProductPrice',
    label: '한국소비자원 생필품 가격 정보 API 키',
    envVarName: 'CONSUMER_PRODUCT_PRICE_API_KEY',
    description: '생필품 가격 정보 API 전용 서버 키입니다.',
  },
];

export const publicDataSources: PublicDataSource[] = [
  {
    name: '식품영양성분DB정보',
    purpose: '품목 기본 정보와 영양성분 보조',
    endpoints: [
      {
        label: '식품영양성분DB정보',
        url: externalApiEndpoints.foodNutritionDb,
        keySlotId: 'foodNutritionDb',
      },
    ],
  },
  {
    name: '한국소비자원 생필품 가격 정보',
    purpose: '생필품/생활용품 가격과 판매처별 가격',
    endpoints: [
      {
        label: '생필품 가격 정보',
        url: externalApiEndpoints.consumerProductPrice,
        keySlotId: 'consumerProductPrice',
      },
    ],
  },
  {
    name: 'KAMIS 농축수산물 가격 정보',
    purpose: '농축수산물 품목 코드, 소매가, 지역별 가격',
    endpoints: [
      {
        label: '농축수산물 품목 및 등급 코드표',
        url: externalApiEndpoints.kamisProductInfo,
        keySlotId: 'kamis',
      },
      {
        label: '일별 품목별 소매 가격자료',
        url: externalApiEndpoints.kamisRetailDailyProduct,
        keySlotId: 'kamis',
      },
      {
        label: '최근일자 지역별 도·소매 가격 정보',
        url: externalApiEndpoints.kamisDailyCounty,
        keySlotId: 'kamis',
      },
      {
        label: '지역별 품목별 도·소매 가격정보',
        url: externalApiEndpoints.kamisRegionalItem,
        keySlotId: 'kamis',
      },
    ],
  },
];

export function getDataSourcesForResponse() {
  return publicDataSources.map((source) => ({
    ...source,
    endpoints: source.endpoints.map((endpoint) => ({
      ...endpoint,
      apiKeyConfigured: isApiKeyConfigured(endpoint.keySlotId),
    })),
  }));
}
