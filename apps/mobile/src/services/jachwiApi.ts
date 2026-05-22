import { API_BASE_URL } from './apiClient';
import { Category, Decision, PriceAlert, PriceItem, ShoppingListItem } from '../types/domain';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, unknown>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? 'API 요청에 실패했습니다.');
  }

  return payload.data;
}

export const jachwiApi = {
  getHomeSummary: () =>
    request<{
      summary: { downCount: number; upCount: number; stableCount: number };
      recommendations: PriceItem[];
      alerts: { unreadCount: number };
    }>('/home/summary'),

  getCategories: () => request<{ categories: Category[] }>('/categories'),

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

  getShoppingList: () =>
    request<{
      items: ShoppingListItem[];
      total: number;
      checked: number;
    }>('/shopping-list'),

  patchShoppingItem: (id: string, payload: Partial<ShoppingListItem>) =>
    request<ShoppingListItem>(`/shopping-list/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getAlerts: () =>
    request<{
      alerts: PriceAlert[];
      onOff: boolean;
    }>('/alerts'),

  patchAlert: (id: string, payload: Partial<PriceAlert>) =>
    request<PriceAlert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getUserMe: () =>
    request<{
      profile: { id: string; nickname: string; authState: string };
      preferences: {
        region: string;
        regionCode: string;
        budget: number;
        categories: string[];
      };
    }>('/users/me'),

  savePreferences: (payload: {
    region: string;
    regionCode: string;
    budget: number;
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
};
