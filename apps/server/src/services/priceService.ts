import { Decision, priceItems } from '../data/catalog.js';
import { alternativeItems } from '../data/runtimeStore.js';

export function searchItems(query?: string, categoryId?: string, items = priceItems) {
  const normalized = query?.trim().toLowerCase() ?? '';

  return items.filter((item) => {
    const matchesQuery =
      !normalized ||
      item.name.toLowerCase().includes(normalized) ||
      item.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));
    const matchesCategory = !categoryId || categoryId === 'all' || item.categoryId === categoryId;

    return matchesQuery && matchesCategory;
  });
}

export function getRecommendations(type?: Decision, items = priceItems) {
  if (!type) {
    return items;
  }

  return items.filter((item) => item.decision === type);
}

export function getHomeSummary(items = priceItems) {
  return {
    summary: {
      downCount: items.filter((item) => item.changeRate7d < 0).length,
      upCount: items.filter((item) => item.changeRate7d > 0).length,
      stableCount: items.filter((item) => Math.abs(item.changeRate7d) <= 1).length,
    },
    recommendations: getRecommendations('BUY', items).slice(0, 10),
    alerts: {
      unreadCount: 1,
    },
  };
}

export function getPriceSummary(items = priceItems) {
  return {
    period: 'weekly',
    downTop: items
      .filter((item) => item.changeRate7d < 0)
      .sort((a, b) => a.changeRate7d - b.changeRate7d)
      .slice(0, 5),
    upTop: items
      .filter((item) => item.changeRate7d > 0)
      .sort((a, b) => b.changeRate7d - a.changeRate7d)
      .slice(0, 5),
  };
}

export function getPriceChanges(items = priceItems) {
  return items
    .map((item) => ({
      itemId: item.id,
      name: item.name,
      avgPrice: item.avgPrice,
      changeRate7d: item.changeRate7d,
      decision: item.decision,
    }))
    .sort((a, b) => Math.abs(b.changeRate7d) - Math.abs(a.changeRate7d));
}

function getItemFrom(items = priceItems, itemId?: string) {
  return items.find((item) => item.id === itemId) ?? items[0];
}

export function getCompareResult(ids: string[], sourceItems = priceItems) {
  const fallbackIds = sourceItems.slice(0, 2).map((item) => item.id);
  const compareItems = (ids.length > 0 ? ids : fallbackIds)
    .map((id) => getItemFrom(sourceItems, id))
    .filter((item): item is (typeof sourceItems)[number] => Boolean(item));
  const sorted = [...compareItems].sort((a, b) => a.avgPrice - b.avgPrice);

  return {
    items: compareItems,
    winner: sorted[0] ?? compareItems[0],
    priceGap: compareItems.length >= 2 ? Math.abs(compareItems[0].avgPrice - compareItems[1].avgPrice) : 0,
  };
}

export function getRegionCompare(itemId?: string, items = priceItems) {
  const item = getItemFrom(items, itemId);

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
