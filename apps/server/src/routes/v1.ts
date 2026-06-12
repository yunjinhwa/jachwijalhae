import { Router } from 'express';
import { categories, type Decision } from '../data/catalog.js';
import { sourceCsvFiles } from '../data/fileDataSeeds.js';
import {
  alertHistory,
  priceAlerts,
  purchaseHistory,
  shoppingItems,
  userPreference,
  type PriceAlert,
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
import { getLiveDataDiagnostics, getLiveNutrition, getLivePriceItems } from '../services/liveDataService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendNotFound, sendOk } from '../utils/response.js';

export const v1Router = Router();

type LivePriceItem = Awaited<ReturnType<typeof getLivePriceItems>>[number];

function parseDecision(type: unknown): Decision | undefined {
  return type === 'BUY' || type === 'WAIT' || type === 'REPLACE' || type === 'NEUTRAL'
    ? type
    : undefined;
}

function parseAlertCondition(condition: unknown): PriceAlert['condition'] {
  return condition === 'WEEKLY_DROP' || condition === 'NEW_LOW' || condition === 'BELOW_TARGET'
    ? condition
    : 'BELOW_TARGET';
}

function parsePositiveNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonNegativeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parsePositiveInteger(value: unknown, fallback: number, max: number) {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function isAlertReached(alert: PriceAlert, item: LivePriceItem | undefined) {
  if (!alert.enabled || !item) return false;

  if (alert.condition === 'WEEKLY_DROP') {
    return item.changeRate7d <= -2;
  }

  if (alert.condition === 'NEW_LOW') {
    return item.avgPrice <= item.minPrice;
  }

  return item.avgPrice <= alert.targetPrice;
}

function toAlertResponse(alert: PriceAlert, items: LivePriceItem[]) {
  const item = items.find((entry) => entry.id === alert.itemId);
  const reached = isAlertReached(alert, item);
  alert.reached = reached;

  if (item) {
    alert.name = item.name;
  }

  return {
    ...alert,
    currentPrice: item?.avgPrice,
  };
}

v1Router.get('/health', (req, res) => {
  sendOk(req, res, { status: 'ok' });
});

v1Router.get('/ready', asyncHandler(async (req, res) => {
  const items = await getLivePriceItems();

  sendOk(req, res, {
    status: 'ready',
    itemCount: items.length,
    diagnostics: getLiveDataDiagnostics(),
  });
}));

v1Router.post('/users/preferences', (req, res) => {
  const {
    region,
    regionCode,
    budget,
    budgetPeriod,
    categories: selectedCategories,
    keywords: selectedKeywords,
  } = req.body ?? {};

  if (typeof region === 'string') userPreference.region = region;
  if (typeof regionCode === 'string') userPreference.regionCode = regionCode;
  if (typeof budget === 'number' && Number.isFinite(budget) && budget >= 0) userPreference.budget = budget;
  if (budgetPeriod === 'weekly' || budgetPeriod === 'monthly') userPreference.budgetPeriod = budgetPeriod;
  if (Array.isArray(selectedCategories)) userPreference.categories = selectedCategories;
  if (Array.isArray(selectedKeywords)) userPreference.keywords = selectedKeywords;

  sendOk(req, res, userPreference);
});

v1Router.get('/users/me', (req, res) => {
  sendOk(req, res, {
    profile: {
      id: 'guest_device',
      nickname: '자취러',
    },
    preferences: userPreference,
  });
});

v1Router.get('/data-sources', (req, res) => {
  sendOk(req, res, {
    apiSources: getDataSourcesForResponse(),
    fileSources: sourceCsvFiles,
    diagnostics: getLiveDataDiagnostics(),
  });
});

v1Router.get('/home/summary', asyncHandler(async (req, res) => {
  const items = await getLivePriceItems();
  sendOk(req, res, getHomeSummary(items, userPreference));
}));

v1Router.get('/prices/summary', asyncHandler(async (req, res) => {
  const items = await getLivePriceItems();
  sendOk(req, res, getPriceSummary(items));
}));

v1Router.get('/prices/changes', asyncHandler(async (req, res) => {
  const items = await getLivePriceItems();
  sendOk(req, res, {
    period: req.query.period ?? 'weekly',
    items: getPriceChanges(items),
  });
}));

v1Router.get('/recommendations', asyncHandler(async (req, res) => {
  const decision = parseDecision(req.query.type);
  const page = parsePositiveInteger(req.query.page, 1, 1000);
  const size = parsePositiveInteger(req.query.size, 30, 100);
  const items = await getLivePriceItems();
  const recommendedItems = getRecommendations(decision, items, userPreference);
  const start = (page - 1) * size;

  sendOk(req, res, {
    decisionType: decision ?? 'ALL',
    itemList: recommendedItems.slice(start, start + size),
    pagination: {
      page,
      size,
      total: recommendedItems.length,
      hasNext: start + size < recommendedItems.length,
    },
  });
}));

v1Router.get('/categories', (req, res) => {
  sendOk(req, res, { categories });
});

v1Router.get('/categories/:categoryId/items', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const items = sourceItems.filter((item) => item.categoryId === req.params.categoryId);

  sendOk(req, res, {
    categoryId: req.params.categoryId,
    items,
  });
}));

v1Router.get('/items/search', asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const interestOnly = req.query.interestOnly === 'true';
  const page = parsePositiveInteger(req.query.page, 1, 1000);
  const size = parsePositiveInteger(req.query.size, 30, 200);
  const sourceItems = await getLivePriceItems();
  const matchedItems = searchItems(q, categoryId, sourceItems, userPreference, interestOnly);
  const start = (page - 1) * size;
  const items = matchedItems.slice(start, start + size);

  sendOk(req, res, {
    keyword: q ?? '',
    items,
    pagination: {
      page,
      size,
      total: matchedItems.length,
      hasNext: start + size < matchedItems.length,
    },
  });
}));

v1Router.get('/items/:itemId/detail', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const item = sourceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    ...item,
    primaryCta: item.decision === 'WAIT' ? 'CREATE_ALERT' : 'ADD_SHOPPING_LIST',
  });
}));

v1Router.get('/items/:itemId/basic', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const item = sourceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');
  const nutrition = await getLiveNutrition(item);

  sendOk(req, res, {
    itemMeta: {
      itemId: item.id,
      name: item.name,
      categoryName: item.categoryName,
      unit: item.unit,
      sourceProductName: item.sourceProductName,
    },
    nutrition,
    source: item.source,
  });
}));

v1Router.get('/items/:itemId/prices', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const item = sourceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    avg: item.avgPrice,
    min: item.minPrice,
    max: item.maxPrice,
    stores: item.sellers,
    region: userPreference.region,
  });
}));

v1Router.get('/items/:itemId/trend', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const item = sourceItems.find((entry) => entry.id === req.params.itemId);
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
}));

v1Router.get('/items/:itemId/sellers', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const item = sourceItems.find((entry) => entry.id === req.params.itemId);
  if (!item) return sendNotFound(res, '품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    sellerPrices: item.sellers,
  });
}));

v1Router.get('/items/:itemId/decision', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const item = sourceItems.find((entry) => entry.id === req.params.itemId);
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
}));

v1Router.get('/items/:itemId/alternatives', asyncHandler(async (req, res) => {
  const sourceItems = await getLivePriceItems();
  const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;

  sendOk(req, res, {
    alternatives: getAlternatives(itemId, sourceItems),
  });
}));

v1Router.get('/compare/items', asyncHandler(async (req, res) => {
  const ids = typeof req.query.ids === 'string' ? req.query.ids.split(',') : [];
  const items = await getLivePriceItems();
  sendOk(req, res, getCompareResult(ids, items));
}));

v1Router.get('/compare/regions', asyncHandler(async (req, res) => {
  const itemId = typeof req.query.itemId === 'string' ? req.query.itemId : undefined;
  const items = await getLivePriceItems();
  sendOk(req, res, getRegionCompare(itemId, items));
}));

v1Router.get('/compare/stores', asyncHandler(async (req, res) => {
  const items = await getLivePriceItems();
  const item = items.find((entry) => entry.id === req.query.itemId) ?? items[0];
  if (!item) return sendNotFound(res, '비교할 품목을 찾을 수 없습니다.');

  sendOk(req, res, {
    item,
    stores: item.sellers,
  });
}));

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
  const quantity = parsePositiveNumber(body.quantity, 1);
  const expectedPrice = parseNonNegativeNumber(body.expectedPrice, 0);
  const item = {
    id: `shop_${Date.now()}`,
    itemId: typeof body.itemId === 'string' ? body.itemId : undefined,
    name: typeof body.name === 'string' && body.name.trim().length > 0 ? body.name.trim() : '직접 추가 품목',
    quantity,
    expectedPrice,
    memo: typeof body.memo === 'string' ? body.memo : undefined,
    checked: false,
  };

  shoppingItems.push(item);
  sendOk(req, res, item);
});

v1Router.patch('/shopping-list/items/:id', (req, res) => {
  const item = shoppingItems.find((entry) => entry.id === req.params.id);
  if (!item) return sendNotFound(res, '장보기 품목을 찾을 수 없습니다.');

  const body = req.body ?? {};
  if (typeof body.itemId === 'string') item.itemId = body.itemId;
  if (typeof body.name === 'string' && body.name.trim().length > 0) item.name = body.name.trim();
  if (typeof body.memo === 'string') item.memo = body.memo;
  if (typeof body.checked === 'boolean') item.checked = body.checked;
  if (body.quantity !== undefined) item.quantity = parsePositiveNumber(body.quantity, item.quantity);
  if (body.expectedPrice !== undefined) item.expectedPrice = parseNonNegativeNumber(body.expectedPrice, item.expectedPrice);

  sendOk(req, res, item);
});

v1Router.delete('/shopping-list/items/:id', (req, res) => {
  const index = shoppingItems.findIndex((entry) => entry.id === req.params.id);
  if (index < 0) return sendNotFound(res, '장보기 품목을 찾을 수 없습니다.');

  const [deletedItem] = shoppingItems.splice(index, 1);
  sendOk(req, res, deletedItem);
});

v1Router.get('/shopping-list/budget', (req, res) => {
  const total = shoppingItems.reduce((sum, item) => sum + item.expectedPrice * item.quantity, 0);

  sendOk(req, res, {
    budget: userPreference.budget,
    budgetPeriod: userPreference.budgetPeriod,
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
    month: req.query.month ?? new Date().toISOString().slice(0, 7),
  });
});

v1Router.get('/alerts', asyncHandler(async (req, res) => {
  const items = await getLivePriceItems();
  const alerts = priceAlerts.map((alert) => toAlertResponse(alert, items));

  sendOk(req, res, {
    alerts,
    onOff: alerts.some((alert) => alert.enabled),
  });
}));

v1Router.post('/alerts', asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const items = await getLivePriceItems();
  const item = items.find((entry) => entry.id === body.itemId);
  if (!item) return sendNotFound(res, '알림을 만들 품목을 찾을 수 없습니다.');

  const alert: PriceAlert = {
    id: `alert_${Date.now()}`,
    itemId: item.id,
    name: item.name,
    targetPrice: parsePositiveNumber(body.targetPrice, item.avgPrice),
    condition: parseAlertCondition(body.condition),
    schedule: typeof body.schedule === 'string' ? body.schedule : 'DAILY_09',
    enabled: true,
    reached: false,
  };
  alert.reached = isAlertReached(alert, item);

  priceAlerts.push(alert);
  sendOk(req, res, toAlertResponse(alert, items));
}));

v1Router.patch('/alerts/:id', asyncHandler(async (req, res) => {
  const alert = priceAlerts.find((entry) => entry.id === req.params.id);
  if (!alert) return sendNotFound(res, '알림을 찾을 수 없습니다.');

  const body = req.body ?? {};
  const items = await getLivePriceItems();
  if (typeof body.itemId === 'string') {
    const item = items.find((entry) => entry.id === body.itemId);
    if (!item) return sendNotFound(res, '알림을 만들 품목을 찾을 수 없습니다.');
    alert.itemId = item.id;
    alert.name = item.name;
  }

  if (body.targetPrice !== undefined) alert.targetPrice = parsePositiveNumber(body.targetPrice, alert.targetPrice);
  if (body.condition !== undefined) alert.condition = parseAlertCondition(body.condition);
  if (typeof body.schedule === 'string') alert.schedule = body.schedule;
  if (typeof body.enabled === 'boolean') alert.enabled = body.enabled;

  sendOk(req, res, toAlertResponse(alert, items));
}));

v1Router.delete('/alerts/:id', (req, res) => {
  const index = priceAlerts.findIndex((entry) => entry.id === req.params.id);
  if (index < 0) return sendNotFound(res, '알림을 찾을 수 없습니다.');

  const [deletedAlert] = priceAlerts.splice(index, 1);
  sendOk(req, res, deletedAlert);
});

v1Router.get('/alerts/history', (req, res) => {
  sendOk(req, res, {
    history: alertHistory,
  });
});
