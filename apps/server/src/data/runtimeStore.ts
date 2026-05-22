import { priceItems, PriceItem } from './catalog.js';

export type UserPreference = {
  region: string;
  regionCode: string;
  budget: number;
  categories: string[];
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

export const userPreference: UserPreference = {
  region: '부산 사상구',
  regionCode: '26440',
  budget: 320000,
  categories: ['생필품', '농산물', '가공식품'],
};

export const shoppingItems: ShoppingListItem[] = [
  {
    id: 'shop_1',
    itemId: 'item_egg_30',
    name: '달걀 15개',
    quantity: 1,
    expectedPrice: 8482,
    checked: true,
  },
  {
    id: 'shop_2',
    itemId: 'item_rice_10',
    name: '쌀 10kg',
    quantity: 1,
    expectedPrice: 28550,
    checked: false,
  },
  {
    id: 'shop_3',
    itemId: 'item_tissue',
    name: '화장지 30롤',
    quantity: 1,
    expectedPrice: 18900,
    checked: false,
  },
];

export const priceAlerts: PriceAlert[] = [
  {
    id: 'alert_1',
    itemId: 'item_rice_10',
    name: '쌀 10kg',
    targetPrice: 27000,
    condition: 'BELOW_TARGET',
    schedule: 'DAILY_09',
    enabled: true,
    reached: false,
  },
  {
    id: 'alert_2',
    itemId: 'item_milk_1',
    name: '서울우유 흰우유 1L',
    targetPrice: 3000,
    condition: 'BELOW_TARGET',
    schedule: 'DAILY_09',
    enabled: true,
    reached: false,
  },
];

export const purchaseHistory = [
  { id: 'p_1', date: '2026-05-18', total: 15655, items: ['달걀 15개', '라면 5개입', '서울우유 흰우유 1L'] },
  { id: 'p_2', date: '2026-05-11', total: 47450, items: ['쌀 10kg', '화장지 30롤'] },
];

export const alertHistory = [
  {
    id: 'ah_1',
    title: '우유 1L 가격 확인',
    body: '소비자원 CSV 기준 서울우유 흰우유 1L 평균가는 3,120원입니다.',
    read: false,
  },
  {
    id: 'ah_2',
    title: '대파 1kg 부산 표본',
    body: 'KAMIS CSV 기준 부산 소매 표본 평균가는 4,650원입니다.',
    read: true,
  },
];

export const alternativeItems = [
  { from: '동원참치 4캔', to: '사조참치 살코기 안심따개 4캔', savingRate: 6, priceGap: 529 },
  { from: '스파크 분말세제 3kg', to: '홈스타 락스와세제 750ml', savingRate: 63, priceGap: 7472 },
  { from: '라면 5개입', to: '진라면 매운맛 5개입', savingRate: 5, priceGap: 205 },
];

export function getItemOrFirst(itemId?: string): PriceItem {
  return priceItems.find((item) => item.id === itemId) ?? priceItems[0];
}
