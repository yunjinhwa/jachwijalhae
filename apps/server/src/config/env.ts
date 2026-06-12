import 'dotenv/config';

export type ApiKeySlotId = 'kamis' | 'foodNutritionDb' | 'consumerProductPrice';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiKeys: {
    kamis: process.env.KAMIS_API_KEY ?? '',
    kamisCertId: process.env.KAMIS_CERT_ID ?? '',
    foodNutritionDb: process.env.FOOD_NUTRITION_DB_API_KEY ?? '',
    consumerProductPrice: process.env.CONSUMER_PRODUCT_PRICE_API_KEY ?? '',
  },
};

export function isApiKeyConfigured(slotId: ApiKeySlotId) {
  if (slotId === 'kamis') {
    return env.apiKeys.kamis.trim().length > 0 && env.apiKeys.kamisCertId.trim().length > 0;
  }

  return env.apiKeys[slotId].trim().length > 0;
}
