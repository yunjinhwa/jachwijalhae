import { Router } from 'express';
import { categories, Decision, priceItems } from '../data/catalog.js';
import { sourceCsvFiles } from '../data/fileDataSeeds.js';
import {
  alertHistory,
  priceAlerts,
  purchaseHistory,
  shoppingItems,
  userPreference,
} from '../data/runtimeStore.js';
import { getDataSourcesForResponse } from '../config/externalApis.js';
import {
  getAlternatives,
  getCompareResult,
  getHomeSummary,
  getPriceChanges,
  getPriceSummary,
  getRecommendations,
  getRegionCompare,
  searchItems,
} from '../services/priceService.js';
import { sendNotFound, sendOk } from '../utils/response.js';

export const v1Router = Router();

function parseDecision(type: unknown): Decision | undefined {
  return type === 'BUY' || type === 'WAIT' || type === 'REPLACE' || type === 'NEUTRAL'
    ? type
    : undefined;
}

v1Router.get('/health', (req, res) => {
  sendOk(req, res, { status: 'ok' });
});

v1Router.post('/users/preferences', (req, res) => {
  const { region, regionCode, budget, categories: selectedCategories } = req.body ?? {};

  if (typeof region === 'string') userPreference.region = region;
  if (typeof regionCode === 'string') userPreference.regionCode = regionCode;
  if (typeof budget === 'number') userPreference.budget = budget;
  if (Array.isArray(selectedCategories)) userPreference.categories = selectedCategories;

  sendOk(req, res, userPreference);
});

v1Router.get('/users/me', (req, res) => {
  sendOk(req, res, {
    profile: {
      id: 'guest_device',
      nickname: '자취러',
      authState: 'ANONYMOUS_SYNC',
    },
    preferences: userPreference,
  });
});

v1Router.get('/data-sources', (req, res) => {
  sendOk(req, res, {
    apiSources: getDataSourcesForResponse(),
    fileSources: sourceCsvFiles,
  });
});

v1Router.get('/home/summary', (req, res) => {
  sendOk(req, res, getHomeSummary());
});

v1Router.get('/prices/summary', (req, res) => {
  sendOk(req, res, getPriceSummary());
});

v1Router.get('/prices/changes', (req, res) => {
  sendOk(req, res, {
    period: req.query.period ?? 'weekly',
    items: getPriceChanges(),
  });
});

v1Router.get('/recommendations', (req, res) => {
  const decision = parseDecision(req.query.type);

  sendOk(req, res, {
    decisionType: decision ?? 'ALL',
    itemList: getRecommendations(decision),
  });
});

v1Router.get('/categories', (req, res) => {
  sendOk(req, res, { categories });
});

v1Router.get('/categories/:categoryId/items', (req, res) => {
  const items = priceItems.filter((item) => item.categoryId === req.params.categoryId);

  sendOk(req, res, {
    categoryId: req.params.categoryId,
    items,
  });
});

v1Router.get('/items/search', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const items = searchItems(q, categoryId);

  sendOk(req, res, {
    keyword: q ?? '',
    items,
    pagination: {
      page: Number(req.query.page ?? 1),
      size: Number(req.query.size ?? 20),
      total: items.length,
    },
  });
});

v1Router.get('/items/:itemId/detail', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    ...item,
    primaryCta: item.decision === 'WAIT' ? 'CREATE_ALERT' : 'ADD_SHOPPING_LIST',
  });
});

v1Router.get('/items/:itemId/basic', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    itemMeta: {
      itemId: item.id,
      name: item.name,
      categoryName: item.categoryName,
      unit: item.unit,
      sourceProductName: item.sourceProductName,
    },
    nutrition: item.nutrition ?? [],
    source: item.source,
  });
});

v1Router.get('/items/:itemId/prices', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    avg: item.avgPrice,
    min: item.minPrice,
    max: item.maxPrice,
    stores: item.sellers,
    region: userPreference.region,
  });
});

v1Router.get('/items/:itemId/trend', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    period: req.query.period ?? '7d',
    priceSeries: item.trend.map((price, index) => ({
      index,
      price,
    })),
    changeRate7d: item.changeRate7d,
    changeRate30d: item.changeRate30d,
  });
});

v1Router.get('/items/:itemId/sellers', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    sellerPrices: item.sellers,
  });
});

v1Router.get('/items/:itemId/decision', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    decision: item.decision,
    reason: item.reason,
    evidence: [
      { label: '30일 평균 대비', value: item.monthlyAvgPrice - item.avgPrice },
      { label: '7일 변동률', value: item.changeRate7d },
      { label: '최저가', value: item.minPrice },
    ],
  });
});

v1Router.get('/items/:itemId/alternatives', (req, res) => {
  sendOk(req, res, {
    alternatives: getAlternatives(),
  });
});

v1Router.get('/compare/items', (req, res) => {
  const ids = typeof req.query.ids === 'string' ? req.query.ids.split(',') : [];
  sendOk(req, res, getCompareResult(ids));
});

v1Router.get('/compare/regions', (req, res) => {
  const itemId = typeof req.query.itemId === 'string' ? req.query.itemId : undefined;
  sendOk(req, res, getRegionCompare(itemId));
});

v1Router.get('/compare/stores', (req, res) => {
  const item = priceItems.find((entry) => entry.id === req.query.itemId) ?? priceItems[0];

  sendOk(req, res, {
    item,
    stores: item.sellers,
  });
});

v1Router.get('/shopping-list', (req, res) => {
  const total = shoppingItems.reduce((sum, item) => sum + item.expectedPrice * item.quantity, 0);

  sendOk(req, res, {
    items: shoppingItems,
    total,
    checked: shoppingItems.filter((item) => item.checked).length,
  });
});

v1Router.post('/shopping-list/items', (req, res) => {
  const body = req.body ?? {};
  const item = {
    id: `shop_${Date.now()}`,
    itemId: typeof body.itemId === 'string' ? body.itemId : undefined,
    name: typeof body.name === 'string' ? body.name : '직접 추가 품목',
    quantity: Number(body.quantity ?? 1),
    expectedPrice: Number(body.expectedPrice ?? 0),
    memo: typeof body.memo === 'string' ? body.memo : undefined,
    checked: false,
  };

  shoppingItems.push(item);
  sendOk(req, res, item);
});

v1Router.patch('/shopping-list/items/:id', (req, res) => {
  const item = shoppingItems.find((entry) => entry.id === req.params.id);
  if (!item) return sendNotFound(res, '장보기 품목을 찾을 수 없습니다.');

  Object.assign(item, req.body);
  sendOk(req, res, item);
});

v1Router.get('/shopping-list/budget', (req, res) => {
  const total = shoppingItems.reduce((sum, item) => sum + item.expectedPrice * item.quantity, 0);

  sendOk(req, res, {
    budget: userPreference.budget,
    total,
    remaining: userPreference.budget - total,
  });
});

v1Router.post('/purchases', (req, res) => {
  const completedItems = shoppingItems.filter((item) => item.checked);
  const total = completedItems.reduce((sum, item) => sum + item.expectedPrice * item.quantity, 0);
  const purchase = {
    id: `p_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    total,
    items: completedItems.map((item) => item.name),
  };

  purchaseHistory.unshift(purchase);
  sendOk(req, res, purchase);
});

v1Router.get('/purchases/history', (req, res) => {
  sendOk(req, res, {
    history: purchaseHistory,
    month: req.query.month ?? '2026-05',
  });
});

v1Router.get('/alerts', (req, res) => {
  sendOk(req, res, {
    alerts: priceAlerts,
    onOff: priceAlerts.some((alert) => alert.enabled),
  });
});

v1Router.post('/alerts', (req, res) => {
  const body = req.body ?? {};
  const item = priceItems.find((entry) => entry.id === body.itemId) ?? priceItems[0];
  const alert = {
    id: `alert_${Date.now()}`,
    itemId: item.id,
    name: item.name,
    targetPrice: Number(body.targetPrice ?? item.avgPrice),
    condition: body.condition ?? 'BELOW_TARGET',
    schedule: body.schedule ?? 'DAILY_09',
    enabled: true,
    reached: false,
  };

  priceAlerts.push(alert);
  sendOk(req, res, alert);
});

v1Router.patch('/alerts/:id', (req, res) => {
  const alert = priceAlerts.find((entry) => entry.id === req.params.id);
  if (!alert) return sendNotFound(res, '알림을 찾을 수 없습니다.');

  Object.assign(alert, req.body);
  sendOk(req, res, alert);
});

v1Router.get('/alerts/history', (req, res) => {
  sendOk(req, res, {
    history: alertHistory,
  });
});
