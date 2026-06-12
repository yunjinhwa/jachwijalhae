import { NativeModules } from 'react-native';

const API_PORT = 4000;
const API_PATH = '/v1';
const WINDOWS_HOTSPOT_HOST = '192.168.137.1';

type SourceCodeModule = {
  scriptURL?: string;
  getConstants?: () => {
    scriptURL?: string;
  };
};

function isPrivateHost(host: string) {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host);
}

function getHostFromUrl(url?: string) {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url.match(/^[^:]+:\/\/([^:/]+)/)?.[1];
  }
}

function getMetroHost() {
  const sourceCode = NativeModules.SourceCode as SourceCodeModule | undefined;
  const scriptURL = sourceCode?.scriptURL ?? sourceCode?.getConstants?.().scriptURL;
  const host = getHostFromUrl(scriptURL);

  if (host && isPrivateHost(host)) {
    return host;
  }

  return undefined;
}

function getWebHost() {
  const location = (globalThis as { location?: { hostname?: string } }).location;
  const host = location?.hostname;

  if (host && isPrivateHost(host)) {
    return host;
  }

  return undefined;
}

function toApiBaseUrl(host: string) {
  return `http://${host}:${API_PORT}${API_PATH}`;
}

function uniqueHosts(hosts: Array<string | undefined>) {
  return hosts.filter((host, index): host is string => !!host && hosts.indexOf(host) === index);
}

export const API_HOST = getMetroHost() ?? getWebHost() ?? 'localhost';
export const API_BASE_URL = toApiBaseUrl(API_HOST);
export const API_BASE_URLS = uniqueHosts([
  API_HOST,
  WINDOWS_HOTSPOT_HOST,
  'localhost',
  '127.0.0.1',
  '10.0.2.2',
]).map(toApiBaseUrl);
export const API_KEY_REQUIRED = '서버 API 키 설정 필요';

export type ApiKeySlotId = 'kamis' | 'foodNutritionDb' | 'consumerProductPrice';

export const externalApiEndpoints = {
  foodNutritionDb: 'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02',
  consumerProductPrice: 'http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductPriceInfoSvc.do',
  kamisProductInfo: 'http://www.kamis.or.kr/service/price/xml.do?action=productInfo',
  kamisRetailDailyProduct: 'http://www.kamis.or.kr/service/price/xml.do?action=periodRetailProductList',
  kamisDailyCounty: 'http://www.kamis.or.kr/service/price/xml.do?action=dailyCountyList',
  kamisRegionalItem: 'http://www.kamis.or.kr/service/price/xml.do?action=ItemInfo',
};

export const apiKeySlots: Array<{
  id: ApiKeySlotId;
  label: string;
  provider: string;
  envVarName: string;
  description: string;
}> = [
  {
    id: 'kamis',
    label: 'KAMIS 통합 API 키',
    provider: 'KAMIS',
    envVarName: 'KAMIS_API_KEY',
    description: 'KAMIS 품목 코드, 소매가, 지역별 가격 API 4개가 서버 키 하나를 공유합니다.',
  },
  {
    id: 'foodNutritionDb',
    label: '식품영양성분DB정보 API 키',
    provider: '공공데이터포털',
    envVarName: 'FOOD_NUTRITION_DB_API_KEY',
    description: '식품영양성분DB정보 API 전용 서버 키입니다.',
  },
  {
    id: 'consumerProductPrice',
    label: '한국소비자원 생필품 가격 정보 API 키',
    provider: '한국소비자원/공공데이터',
    envVarName: 'CONSUMER_PRODUCT_PRICE_API_KEY',
    description: '생필품 가격 정보 API 전용 서버 키입니다.',
  },
];

export type ExternalApiEndpoint = {
  label: string;
  url: string;
  keySlotId: ApiKeySlotId;
  apiKeyConfigured?: boolean;
};

export type PublicDataSource = {
  name: string;
  purpose: string;
  endpoints: ExternalApiEndpoint[];
};

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

const allExternalApis = publicDataSources.flatMap((source) => source.endpoints);

const kamisCodeApi = publicDataSources[2].endpoints[0];
const kamisRetailApi = publicDataSources[2].endpoints[1];
const kamisCountyApi = publicDataSources[2].endpoints[2];
const kamisRegionalApi = publicDataSources[2].endpoints[3];
const consumerPriceApi = publicDataSources[1].endpoints[0];
const nutritionApi = publicDataSources[0].endpoints[0];

export const screenExternalApiMap: Record<string, ExternalApiEndpoint[]> = {
  priceSummary: [consumerPriceApi, kamisCountyApi, kamisRetailApi],
  recommendations: [consumerPriceApi, kamisRetailApi, kamisRegionalApi],
  priceChanges: [consumerPriceApi, kamisCountyApi, kamisRetailApi],
  searchResults: [consumerPriceApi, kamisCodeApi, kamisRetailApi],
  searchEmpty: [consumerPriceApi, kamisCodeApi],
  categoryItems: [consumerPriceApi, kamisCodeApi, kamisRetailApi],
  itemDetail: [consumerPriceApi, kamisRetailApi, kamisRegionalApi],
  itemBasic: [kamisCodeApi, nutritionApi],
  itemPrices: [consumerPriceApi, kamisRetailApi, kamisRegionalApi],
  priceTrend: [kamisRetailApi, kamisRegionalApi],
  sellerPrices: [consumerPriceApi, kamisRegionalApi],
  itemDecision: [consumerPriceApi, kamisRetailApi, kamisRegionalApi],
  buyDecision: [consumerPriceApi, kamisRetailApi],
  waitDecision: [consumerPriceApi, kamisRetailApi],
  alternatives: [consumerPriceApi, kamisRetailApi],
  compareSelect: [consumerPriceApi, kamisCodeApi],
  compareResult: [consumerPriceApi, kamisRetailApi, kamisRegionalApi],
  compareRegions: [kamisCountyApi, kamisRegionalApi],
  compareStores: [consumerPriceApi, kamisRegionalApi],
  settings: allExternalApis,
};

export function getExternalApisForScreen(kind: string) {
  return screenExternalApiMap[kind] ?? [];
}

export function getApiKeySlot(slotId: ApiKeySlotId) {
  return apiKeySlots.find((slot) => slot.id === slotId);
}

export function getEndpointStatus(api: string) {
  if (api === '-' || api === 'client state') {
    return '로컬 상태';
  }

  return '연결 대기';
}
