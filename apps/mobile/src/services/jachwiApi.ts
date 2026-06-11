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

const REQUEST_TIMEOUT_MS = 8000;

class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

async function fetchWithTimeout(baseUrl: string, path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let lastError: unknown;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetchWithTimeout(baseUrl, path, init);
      const payload = (await response.json()) as ApiResponse<T>;

      if (!response.ok || !payload.success) {
        throw new ApiResponseError(payload.error?.message ?? 'API 요청에 실패했습니다.');
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
    throw new Error(`서버 응답이 지연되고 있습니다. 감지된 서버 주소(${API_BASE_URL})와 후보 주소(${API_BASE_URLS.join(', ')})를 확인해 주세요.`);
  }

  if (lastError instanceof TypeError) {
    throw new Error(`서버에 연결하지 못했습니다. 감지된 서버 주소는 ${API_BASE_URL}이고 후보 주소는 ${API_BASE_URLS.join(', ')} 입니다.`);
  }

  throw lastError instanceof Error ? lastError : new Error('서버 요청에 실패했습니다.');
}

export const jachwiApi = {
  getHomeSummary: () =>
    request<{
      summary: { downCount: number; upCount: number; stableCount: number };
      recommendations: PriceItem[];
      alerts: { unreadCount: number };
    }>('/home/summary'),

  getPriceSummary: () =>
    request<{
      period: string;
      downTop: PriceItem[];
      upTop: PriceItem[];
    }>('/prices/summary'),

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
    }>(`/categories/${encodeURIComponent(categoryId)}/items`),

  searchItems: (params: { q?: string; categoryId?: string }) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.categoryId && params.categoryId !== 'all') query.set('categoryId', params.categoryId);

    return request<{
      keyword: string;
      items: PriceItem[];
      pagination: { page: number; size: number; total: number };
    }>(`/items/search?${query.toString()}`);
  },

  getItemDetail: (itemId: string) => request<PriceItem & { primaryCta: string }>(`/items/${itemId}/detail`),

  getItemBasic: (itemId: string) =>
    request<{
      itemMeta: {
        itemId: string;
        name: string;
        categoryName: string;
        unit: string;
        sourceProductName?: string;
      };
      nutrition: Array<{ label: string; value: string }>;
      source: string;
    }>(`/items/${encodeURIComponent(itemId)}/basic`),

  getItemPrices: (itemId: string) =>
    request<{
      avg: number;
      min: number;
      max: number;
      stores: PriceItem['sellers'];
      region: string;
    }>(`/items/${encodeURIComponent(itemId)}/prices`),

  getItemTrend: (itemId: string, period = '7d') =>
    request<{
      period: string;
      priceSeries: Array<{ index: number; price: number }>;
      changeRate7d: number;
      changeRate30d: number;
    }>(`/items/${encodeURIComponent(itemId)}/trend?period=${encodeURIComponent(period)}`),

  getItemSellers: (itemId: string) =>
    request<{
      sellerPrices: PriceItem['sellers'];
    }>(`/items/${encodeURIComponent(itemId)}/sellers`),

  getItemDecision: (itemId: string) =>
    request<{
      decision: Decision;
      reason: string;
      evidence: Array<{ label: string; value: number }>;
    }>(`/items/${encodeURIComponent(itemId)}/decision`),

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
    }>(`/compare/items?${query.toString()}`);
  },

  getCompareRegions: (itemId?: string) => {
    const query = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';

    return request<{
      item: PriceItem;
      regions: Array<{ regionName: string; avgPrice: number }>;
    }>(`/compare/regions${query}`);
  },

  getCompareStores: (itemId?: string) => {
    const query = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';

    return request<{
      item: PriceItem;
      stores: PriceItem['sellers'];
    }>(`/compare/stores${query}`);
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
    }),

  patchShoppingItem: (id: string, payload: Partial<ShoppingListItem>) =>
    request<ShoppingListItem>(`/shopping-list/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteShoppingItem: (id: string) =>
    request<ShoppingListItem>(`/shopping-list/items/${id}`, {
      method: 'DELETE',
    }),

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
    }),

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
    }),

  patchAlert: (id: string, payload: Partial<PriceAlert>) =>
    request<PriceAlert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

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
    }),

  getRecommendations: (type?: Decision) => {
    const query = type ? `?type=${type}` : '';

    return request<{
      decisionType: Decision | 'ALL';
      itemList: PriceItem[];
    }>(`/recommendations${query}`);
  },

  getDataSources: () => request<DataSourcesResponse>('/data-sources'),
};
