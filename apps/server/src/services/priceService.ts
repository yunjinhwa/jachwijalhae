import { priceItems, type Decision, type PriceItem } from '../data/catalog.js';

export type PricePreference = {
  categories?: string[];
  keywords?: string[];
};

const categoryAliases: Record<string, string[]> = {
  daily: ['daily', '생활용품', '생필품'],
  farm: ['farm', '농산물', '채소', '과일'],
  livestock: ['livestock', '축산물'],
  seafood: ['seafood', '수산물'],
  processed: ['processed', '가공식품', '식품'],
  personal: ['personal', '개인위생'],
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function itemSearchText(item: PriceItem) {
  return [item.name, item.categoryName, item.sourceProductName, ...item.keywords]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getPreferenceScore(item: PriceItem, preference?: PricePreference) {
  const categories = preference?.categories?.map(normalize).filter(Boolean) ?? [];
  const keywords = preference?.keywords?.map(normalize).filter(Boolean) ?? [];
  if (categories.length === 0 && keywords.length === 0) return 0;

  const categoryId = normalize(item.categoryId);
  const categoryName = normalize(item.categoryName);
  const aliases = (categoryAliases[item.categoryId] ?? []).map(normalize);
  const text = itemSearchText(item);
  let score = 0;

  if (categories.some((category) => category === categoryId || category === categoryName || aliases.includes(category))) {
    score += 4;
  }

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      score += 3;
    }
  }

  return score;
}

function sortByPreference(items: PriceItem[], preference?: PricePreference) {
  return items
    .map((item, index) => ({ item, index, score: getPreferenceScore(item, preference) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}

function filterByPreference(items: PriceItem[], preference?: PricePreference, fallbackToAll = true) {
  const preferredItems = items.filter((item) => getPreferenceScore(item, preference) > 0);
  return preferredItems.length > 0 || !fallbackToAll ? preferredItems : items;
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((token) => token.length >= 2 || /^[가-힣]$/.test(token));
}

function isUsefulSimilarityToken(token: string) {
  const normalized = normalize(token);
  if (!normalized) return false;

  return !/^\d+(\.\d+)?(kg|g|l|ml|개|입|롤|캔|포기|마리|봉|팩|매|장)?$/i.test(normalized);
}

function getSimilarityScore(source: PriceItem, candidate: PriceItem) {
  const sourceTokens = new Set([
    ...tokenize(source.name),
    ...source.keywords.map(normalize),
  ].filter(isUsefulSimilarityToken));
  const candidateTokens = new Set([
    ...tokenize(candidate.name),
    ...candidate.keywords.map(normalize),
  ].filter(isUsefulSimilarityToken));

  let overlap = 0;
  sourceTokens.forEach((token) => {
    if (candidateTokens.has(token)) overlap += 1;
  });

  return overlap;
}

export function searchItems(
  query?: string,
  categoryId?: string,
  items = priceItems,
  preference?: PricePreference,
  interestOnly = false,
) {
  const normalized = query?.trim().toLowerCase() ?? '';

  const matchedItems = items.filter((item) => {
    const matchesQuery =
      !normalized ||
      itemSearchText(item).includes(normalized);
    const matchesCategory = !categoryId || categoryId === 'all' || item.categoryId === categoryId;

    return matchesQuery && matchesCategory;
  });

  const preferredItems = interestOnly ? filterByPreference(matchedItems, preference, false) : matchedItems;
  return sortByPreference(preferredItems, preference);
}

export function getRecommendations(type?: Decision, items = priceItems, preference?: PricePreference) {
  const filteredItems = type ? items.filter((item) => item.decision === type) : items;

  return sortByPreference(filterByPreference(filteredItems, preference), preference);
}

export function getHomeSummary(items = priceItems, preference?: PricePreference) {
  const summaryItems = filterByPreference(items, preference);

  return {
    summary: {
      downCount: summaryItems.filter((item) => item.changeRate7d < 0).length,
      upCount: summaryItems.filter((item) => item.changeRate7d > 0).length,
      stableCount: summaryItems.filter((item) => Math.abs(item.changeRate7d) <= 1).length,
    },
    recommendations: getRecommendations('BUY', items, preference).slice(0, 10),
    alerts: {
      unreadCount: 0,
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

function getItemFrom(items: PriceItem[] = priceItems, itemId?: string) {
  return items.find((item) => item.id === itemId) ?? items[0];
}

export function getCompareResult(ids: string[], sourceItems: PriceItem[] = priceItems) {
  const fallbackIds = sourceItems.slice(0, 2).map((item) => item.id);
  const compareItems = (ids.length > 0 ? ids : fallbackIds)
    .map((id) => getItemFrom(sourceItems, id))
    .filter((item): item is PriceItem => Boolean(item));
  const sorted = [...compareItems].sort((a, b) => a.avgPrice - b.avgPrice);

  return {
    items: compareItems,
    winner: sorted[0] ?? null,
    priceGap: compareItems.length >= 2 ? Math.abs(compareItems[0].avgPrice - compareItems[1].avgPrice) : 0,
  };
}

export function getRegionCompare(itemId?: string, items: PriceItem[] = priceItems) {
  const item = getItemFrom(items, itemId);
  if (!item) {
    return {
      item: null,
      regions: [],
    };
  }

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

export function getAlternatives(itemId?: string, items: PriceItem[] = priceItems) {
  const item = getItemFrom(items, itemId);
  if (!item || item.avgPrice <= 0) {
    return [];
  }

  const rankedCandidates = items
    .filter((candidate) => (
      candidate.id !== item.id &&
      candidate.categoryId === item.categoryId &&
      candidate.avgPrice > 0 &&
      candidate.avgPrice < item.avgPrice
    ))
    .map((candidate) => {
      const priceGap = item.avgPrice - candidate.avgPrice;
      return {
        candidate,
        priceGap,
        similarityScore: getSimilarityScore(item, candidate),
      };
    });

  return rankedCandidates
    .filter((entry) => entry.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore || b.priceGap - a.priceGap)
    .slice(0, 3)
    .map(({ candidate, priceGap }) => {
      return {
        itemId: candidate.id,
        fromItemId: item.id,
        from: item.name,
        to: candidate.name,
        categoryName: candidate.categoryName,
        avgPrice: candidate.avgPrice,
        savingRate: Math.round((priceGap / item.avgPrice) * 100),
        priceGap,
      };
    });
}
