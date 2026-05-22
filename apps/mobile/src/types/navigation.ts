export type RootStackParamList = {
  Onboarding: undefined;
  Setup: undefined;
  MainTabs: undefined;

  PriceSummary: undefined;
  Recommendations: undefined;
  PriceChanges: undefined;
  RecentItems: undefined;

  SearchResults: { keyword?: string } | undefined;
  SearchEmpty: { keyword?: string } | undefined;
  Categories: undefined;
  CategoryItems: { categoryId: string; categoryName?: string };
  ItemFilter: undefined;

  ItemDetail: { itemId?: string } | undefined;
  ItemBasic: { itemId?: string } | undefined;
  ItemPrices: { itemId?: string } | undefined;
  PriceTrend: { itemId?: string } | undefined;
  SellerPrices: { itemId?: string } | undefined;
  ItemDecision: { itemId?: string } | undefined;

  BuyDecision: undefined;
  WaitDecision: undefined;
  Alternatives: { itemId?: string } | undefined;

  CompareSelect: undefined;
  CompareResult: undefined;
  CompareRegions: { itemId?: string } | undefined;
  CompareStores: { itemId?: string } | undefined;

  ShoppingEdit: { id?: string } | undefined;
  ShoppingBudget: undefined;
  ShoppingComplete: undefined;
  PurchaseHistory: undefined;

  AlertEdit: { id?: string } | undefined;
  AlertHistory: undefined;

  Settings: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ShoppingTab: undefined;
  AlertsTab: undefined;
  MyPageTab: undefined;
};
