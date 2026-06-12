export type UserPreference = {
  region: string;
  regionCode: string;
  budget: number;
  budgetPeriod: 'weekly' | 'monthly';
  categories: string[];
  keywords: string[];
};

export type ShoppingListItem = {
  id: string;
  itemId?: string;
  name: string;
  quantity: number;
  expectedPrice: number;
  memo?: string;
  checked: boolean;
};

export type PriceAlert = {
  id: string;
  itemId: string;
  name: string;
  targetPrice: number;
  condition?: 'BELOW_TARGET' | 'WEEKLY_DROP' | 'NEW_LOW';
  schedule?: string;
  enabled: boolean;
  reached: boolean;
};

export type PurchaseHistoryItem = {
  id: string;
  date: string;
  total: number;
  items: string[];
};

export type AlertHistoryItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
};

export const userPreference: UserPreference = {
  region: '부산광역시 수영구',
  regionCode: '26440',
  budget: 320000,
  budgetPeriod: 'monthly',
  categories: ['생활용품', '축산물', '가공식품'],
  keywords: ['계란', '쌀', '라면'],
};

export const shoppingItems: ShoppingListItem[] = [];

export const priceAlerts: PriceAlert[] = [];

export const purchaseHistory: PurchaseHistoryItem[] = [];

export const alertHistory: AlertHistoryItem[] = [];
