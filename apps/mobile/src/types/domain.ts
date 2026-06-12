export type Decision = 'BUY' | 'WAIT' | 'REPLACE' | 'NEUTRAL';
export type BudgetPeriod = 'weekly' | 'monthly';

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
  currentPrice?: number;
};

export type PriceChangeItem = {
  itemId: string;
  name: string;
  avgPrice: number;
  changeRate7d: number;
  decision: Decision;
};

export type AlternativeItem = {
  itemId: string;
  fromItemId?: string;
  from: string;
  to: string;
  categoryName?: string;
  avgPrice?: number;
  priceGap: number;
  savingRate: number;
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

export type CsvSourceFile = {
  id: string;
  name: string;
  path: string;
  encoding: string;
  rowCount: number;
  latestDate: string;
  columns: string[];
};

export type ApiDataSourceEndpoint = {
  label: string;
  url: string;
  keySlotId: 'kamis' | 'foodNutritionDb' | 'consumerProductPrice';
  apiKeyConfigured?: boolean;
};

export type ApiDataSource = {
  name: string;
  purpose: string;
  endpoints: ApiDataSourceEndpoint[];
};

export type DataSourcesResponse = {
  apiSources: ApiDataSource[];
  fileSources: CsvSourceFile[];
};
