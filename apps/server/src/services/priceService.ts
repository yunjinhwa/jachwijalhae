import { Decision, priceItems } from '../data/catalog.js';
import { alternativeItems, getItemOrFirst } from '../data/runtimeStore.js';

export function searchItems(query?: string, categoryId?: string) {
  const normalized = query?.trim().toLowerCase() ?? '';

  return priceItems.filter((item) => {
    const matchesQuery =
      !normalized ||
      item.name.toLowerCase().includes(normalized) ||
      item.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));
    const matchesCategory = !categoryId || categoryId === 'all' || item.categoryId === categoryId;

    return matchesQuery && matchesCategory;
  });
}

export function getRecommendations(type?: Decision) {
  if (!type) {
    return priceItems;
  }

  return priceItems.filter((item) => item.decision === type);
}

export function getHomeSummary() {
  return {
    summary: {
      downCount: priceItems.filter((item) => item.changeRate7d < 0).length,
      upCount: priceItems.filter((item) => item.changeRate7d > 0).length,
      stableCount: priceItems.filter((item) => Math.abs(item.changeRate7d) <= 1).length,
    },
    recommendations: getRecommendations('BUY').slice(0, 3),
    alerts: {
      unreadCount: 1,
    },
  };
}

export function getPriceSummary() {
  return {
    period: 'weekly',
    downTop: priceItems
      .filter((item) => item.changeRate7d < 0)
      .sort((a, b) => a.changeRate7d - b.changeRate7d)
      .slice(0, 5),
    upTop: priceItems
      .filter((item) => item.changeRate7d > 0)
      .sort((a, b) => b.changeRate7d - a.changeRate7d)
      .slice(0, 5),
  };
}

export function getPriceChanges() {
  return priceItems
    .map((item) => ({
      itemId: item.id,
      name: item.name,
      avgPrice: item.avgPrice,
      changeRate7d: item.changeRate7d,
      decision: item.decision,
    }))
    .sort((a, b) => Math.abs(b.changeRate7d) - Math.abs(a.changeRate7d));
}

export function getCompareResult(ids: string[]) {
  const items = (ids.length > 0 ? ids : ['item_rice_10', 'item_green_onion']).map((id) =>
    getItemOrFirst(id),
  );
  const sorted = [...items].sort((a, b) => a.avgPrice - b.avgPrice);

  return {
    items,
    winner: sorted[0],
    priceGap: items.length >= 2 ? Math.abs(items[0].avgPrice - items[1].avgPrice) : 0,
  };
}

export function getRegionCompare(itemId?: string) {
  const item = getItemOrFirst(itemId);

  return {
    item,
    regions: [
      { regionName: '부산 사상구', avgPrice: item.avgPrice },
      { regionName: '전국 평균', avgPrice: item.avgPrice + 420 },
      { regionName: '서울 마포구', avgPrice: item.avgPrice + 680 },
      { regionName: '대전 서구', avgPrice: Math.max(item.avgPrice - 210, 0) },
    ],
  };
}

export function getAlternatives() {
  return alternativeItems;
}
