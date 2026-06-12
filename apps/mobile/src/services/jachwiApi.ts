import { API_BASE_URL, API_BASE_URLS } from './apiClient';
import {
  AlertHistoryItem,
  AlternativeItem,
  BudgetPeriod,
  Category,
  DataSourcesResponse,
  Decision,
  PriceAlert,
  PriceChangeItem,
  PriceItem,
  PurchaseHistoryItem,
  ShoppingListItem,
} from '../types/domain';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, unknown>;
};

type ItemDetailResponse = PriceItem & { primaryCta: string };
type ItemBasicResponse = {
  itemMeta: {
    itemId: string;
    name: string;
    categoryName: string;
    unit: string;
    sourceProductName?: string;
  };
  nutrition: Array<{ label: string; value: string }>;
  source: string;
};

const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const WRITE_REQUEST_TIMEOUT_MS = 5000;
const QUICK_READ_TIMEOUT_MS = 5000;

type RequestOptions = {
  timeoutMs?: number;
  baseUrls?: string[];
};

class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

class RequestTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`서버 응답이 ${Math.round(timeoutMs / 1000)}초 이상 지연되고 있습니다.`);
    this.name = 'AbortError';
  }
}

async function fetchWithTimeout(
  baseUrl: string,
  path: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const requestPromise = fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
    signal: controller.signal,
  });

  const timeoutPromise = new Promise<Response>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new RequestTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([requestPromise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function request<T>(path: string, init?: RequestInit, options: RequestOptions = {}): Promise<T> {
  let lastError: unknown;
  const baseUrls = options.baseUrls ?? API_BASE_URLS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetchWithTimeout(baseUrl, path, init, timeoutMs);
      const payload = (await response.json()) as ApiResponse<T>;

      if (!response.ok || !payload.success) {
        throw new ApiResponseError(payload.error?.message ?? '요청에 실패했습니다.');
      }

      return payload.data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        throw error;
      }

      lastError = error;
    }
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw new Error(`서버 응답이 지연되고 있습니다. 서버가 켜져 있는지 확인해 주세요. 감지된 주소: ${API_BASE_URL}`);
  }

  if (lastError instanceof TypeError) {
    throw new Error(`서버에 연결하지 못했습니다. 서버가 켜져 있는지 확인해 주세요. 감지된 주소: ${API_BASE_URL}`);
  }

  throw lastError instanceof Error ? lastError : new Error('서버 요청에 실패했습니다.');
}

const quickWriteRequestOptions = {
  timeoutMs: WRITE_REQUEST_TIMEOUT_MS,
  baseUrls: API_BASE_URLS.slice(0, 2),
};

const quickReadRequestOptions = {
  timeoutMs: QUICK_READ_TIMEOUT_MS,
  baseUrls: API_BASE_URLS.slice(0, 2),
};

const itemDetailCache = new Map<string, ItemDetailResponse>();
const itemDetailRequests = new Map<string, Promise<ItemDetailResponse>>();

function getPrimaryCta(decision: Decision) {
  return decision === 'WAIT' ? 'CREATE_ALERT' : 'ADD_SHOPPING_LIST';
}

function toItemDetail(item: PriceItem): ItemDetailResponse {
  return {
    ...item,
    keywords: [...item.keywords],
    trend: [...item.trend],
    sellers: item.sellers.map((seller) => ({ ...seller })),
    nutrition: item.nutrition?.map((entry) => ({ ...entry })),
    primaryCta: getPrimaryCta(item.decision),
  };
}

function cachePriceItems(items?: PriceItem[]) {
  items?.forEach((item) => {
    itemDetailCache.set(item.id, toItemDetail(item));
  });
}

function cacheItemDetail(item: ItemDetailResponse) {
  itemDetailCache.set(item.id, toItemDetail(item));
  return item;
}

function getCachedItemDetail(itemId: string) {
  const cached = itemDetailCache.get(itemId);
  return cached ? toItemDetail(cached) : undefined;
}

function getItemDetailFast(itemId: string) {
  const cached = getCachedItemDetail(itemId);
  if (cached) return Promise.resolve(cached);

  const activeRequest = itemDetailRequests.get(itemId);
  if (activeRequest) return activeRequest;

  const detailRequest = request<ItemDetailResponse>(`/items/${encodeURIComponent(itemId)}/detail`)
    .then(cacheItemDetail)
    .finally(() => {
      itemDetailRequests.delete(itemId);
    });
  itemDetailRequests.set(itemId, detailRequest);

  return detailRequest;
}

function toItemBasic(item: PriceItem): ItemBasicResponse {
  return {
    itemMeta: {
      itemId: item.id,
      name: item.name,
      categoryName: item.categoryName,
      unit: item.unit,
      sourceProductName: item.sourceProductName,
    },
    nutrition: item.nutrition ?? [],
    source: item.source,
  };
}

export const jachwiApi = {
  getHomeSummary: () =>
    request<{
      summary: { downCount: number; upCount: number; stableCount: number };
      recommendations: PriceItem[];
      alerts: { unreadCount: number };
    }>('/home/summary').then((data) => {
      cachePriceItems(data.recommendations);
      return data;
    }),

  getPriceSummary: () =>
    request<{
      period: string;
      downTop: PriceItem[];
      upTop: PriceItem[];
    }>('/prices/summary').then((data) => {
      cachePriceItems([...data.downTop, ...data.upTop]);
      return data;
    }),

  getPriceChanges: (period = 'weekly') =>
    request<{
      period: string;
      items: PriceChangeItem[];
    }>(`/prices/changes?period=${encodeURIComponent(period)}`),

  getCategories: () => request<{ categories: Category[] }>('/categories'),

  getCategoryItems: (categoryId: string) =>
    request<{
      categoryId: string;
      items: PriceItem[];
    }>(`/categories/${encodeURIComponent(categoryId)}/items`).then((data) => {
      cachePriceItems(data.items);
      return data;
    }),

  searchItems: (params: { q?: string; categoryId?: string }) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.categoryId && params.categoryId !== 'all') query.set('categoryId', params.categoryId);

    return request<{
      keyword: string;
      items: PriceItem[];
      pagination: { page: number; size: number; total: number };
    }>(`/items/search?${query.toString()}`).then((data) => {
      cachePriceItems(data.items);
      return data;
    });
  },

  getItemDetail: (itemId: string) => {
    return getItemDetailFast(itemId);
  },

  getItemBasic: (itemId: string) => {
    const cached = getCachedItemDetail(itemId);
    if (cached?.nutrition?.length) return Promise.resolve(toItemBasic(cached));

    return request<ItemBasicResponse>(`/items/${encodeURIComponent(itemId)}/basic`, undefined, quickReadRequestOptions)
      .then((data) => {
        if (cached && data.nutrition.length > 0) {
          cacheItemDetail({ ...cached, nutrition: data.nutrition });
        }

        return data;
      })
      .catch((error: unknown) => {
        if (cached) return toItemBasic(cached);
        throw error;
      });
  },

  getItemPrices: (itemId: string) =>
    getItemDetailFast(itemId).then((item) => ({
      avg: item.avgPrice,
      min: item.minPrice,
      max: item.maxPrice,
      stores: item.sellers,
      region: '',
    })),

  getItemTrend: (itemId: string, period = '7d') =>
    getItemDetailFast(itemId).then((item) => ({
      period,
      priceSeries: item.trend.map((price, index) => ({ index, price })),
      changeRate7d: item.changeRate7d,
      changeRate30d: item.changeRate30d,
    })),

  getItemSellers: (itemId: string) =>
    getItemDetailFast(itemId).then((item) => ({
      sellerPrices: item.sellers,
    })),

  getItemDecision: (itemId: string) =>
    getItemDetailFast(itemId).then((item) => ({
      decision: item.decision,
      reason: item.reason,
      evidence: [
        { label: '30일 평균 대비', value: item.monthlyAvgPrice - item.avgPrice },
        { label: '7일 변동률', value: item.changeRate7d },
        { label: '최저가', value: item.minPrice },
      ],
    })),

  getAlternatives: (itemId: string) =>
    request<{
      alternatives: AlternativeItem[];
    }>(`/items/${encodeURIComponent(itemId)}/alternatives`),

  getCompareItems: (ids: string[]) => {
    const query = new URLSearchParams();
    if (ids.length > 0) query.set('ids', ids.join(','));

    return request<{
      items: PriceItem[];
      winner: PriceItem;
      priceGap: number;
    }>(`/compare/items?${query.toString()}`).then((data) => {
      cachePriceItems([...data.items, data.winner]);
      return data;
    });
  },

  getCompareRegions: (itemId?: string) => {
    const query = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';

    return request<{
      item: PriceItem;
      regions: Array<{ regionName: string; avgPrice: number }>;
    }>(`/compare/regions${query}`).then((data) => {
      cachePriceItems([data.item]);
      return data;
    });
  },

  getCompareStores: (itemId?: string) => {
    const query = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';

    return request<{
      item: PriceItem;
      stores: PriceItem['sellers'];
    }>(`/compare/stores${query}`).then((data) => {
      cachePriceItems([data.item]);
      return data;
    });
  },

  getShoppingList: () =>
    request<{
      items: ShoppingListItem[];
      total: number;
      checked: number;
    }>('/shopping-list'),

  addShoppingItem: (payload: Omit<ShoppingListItem, 'id' | 'checked'> & { checked?: boolean }) =>
    request<ShoppingListItem>('/shopping-list/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, quickWriteRequestOptions),

  patchShoppingItem: (id: string, payload: Partial<ShoppingListItem>) =>
    request<ShoppingListItem>(`/shopping-list/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, quickWriteRequestOptions),

  deleteShoppingItem: (id: string) =>
    request<ShoppingListItem>(`/shopping-list/items/${id}`, {
      method: 'DELETE',
    }, quickWriteRequestOptions),

  getShoppingBudget: () =>
    request<{
      budget: number;
      budgetPeriod: BudgetPeriod;
      total: number;
      remaining: number;
    }>('/shopping-list/budget'),

  completePurchase: () =>
    request<PurchaseHistoryItem>('/purchases', {
      method: 'POST',
    }, quickWriteRequestOptions),

  getPurchaseHistory: (month?: string) => {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';

    return request<{
      history: PurchaseHistoryItem[];
      month: string;
    }>(`/purchases/history${query}`);
  },

  getAlerts: () =>
    request<{
      alerts: PriceAlert[];
      onOff: boolean;
    }>('/alerts'),

  createAlert: (payload: {
    itemId: string;
    targetPrice: number;
    condition?: PriceAlert['condition'];
    schedule?: string;
  }) =>
    request<PriceAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, quickWriteRequestOptions),

  patchAlert: (id: string, payload: Partial<PriceAlert>) =>
    request<PriceAlert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, quickWriteRequestOptions),

  deleteAlert: (id: string) =>
    request<PriceAlert>(`/alerts/${id}`, {
      method: 'DELETE',
    }, quickWriteRequestOptions),

  getAlertHistory: () =>
    request<{
      history: AlertHistoryItem[];
    }>('/alerts/history'),

  getUserMe: () =>
    request<{
      profile: { id: string; nickname: string; authState: string };
      preferences: {
        region: string;
        regionCode: string;
        budget: number;
        budgetPeriod: BudgetPeriod;
        categories: string[];
      };
    }>('/users/me'),

  savePreferences: (payload: {
    region: string;
    regionCode: string;
    budget: number;
    budgetPeriod?: BudgetPeriod;
    categories: string[];
  }) =>
    request<typeof payload>('/users/preferences', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, quickWriteRequestOptions),

  getRecommendations: (type?: Decision) => {
    const query = type ? `?type=${type}` : '';

    return request<{
      decisionType: Decision | 'ALL';
      itemList: PriceItem[];
    }>(`/recommendations${query}`).then((data) => {
      cachePriceItems(data.itemList);
      return data;
    });
  },

  getDataSources: () => request<DataSourcesResponse>('/data-sources'),
};
