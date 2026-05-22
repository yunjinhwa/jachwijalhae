import { env } from '../config/env.js';
import { externalApiEndpoints } from '../config/externalApis.js';

type QueryValue = string | number | boolean | undefined;
type Query = Record<string, QueryValue>;
type KamisEndpoint = 'kamisProductInfo' | 'kamisRetailDailyProduct' | 'kamisDailyCounty' | 'kamisRegionalItem';

function buildUrl(base: string, query: Query) {
  const url = new URL(base);

  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'undefined' && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function buildKamisUrl(endpoint: KamisEndpoint, query: Query = {}) {
  return buildUrl(externalApiEndpoints[endpoint], {
    p_cert_key: env.apiKeys.kamis,
    p_cert_id: env.apiKeys.kamisCertId,
    p_returntype: 'json',
    ...query,
  });
}

export function buildFoodNutritionUrl(query: Query = {}) {
  return buildUrl(externalApiEndpoints.foodNutritionDb, {
    serviceKey: env.apiKeys.foodNutritionDb,
    type: 'json',
    ...query,
  });
}

export function buildConsumerProductPriceUrl(query: Query = {}) {
  return buildUrl(externalApiEndpoints.consumerProductPrice, {
    serviceKey: env.apiKeys.consumerProductPrice,
    ...query,
  });
}
