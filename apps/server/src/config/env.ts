import 'dotenv/config';

export type ApiKeySlotId = 'kamis' | 'foodNutritionDb' | 'consumerProductPrice';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiKeys: {
    kamis: process.env.KAMIS_API_KEY ?? '',
    kamisCertId: process.env.KAMIS_CERT_ID ?? '',
    foodNutritionDb: process.env.FOOD_NUTRITION_DB_API_KEY ?? '',
    consumerProductPrice: process.env.CONSUMER_PRODUCT_PRICE_API_KEY ?? '',
  },
};

export function isApiKeyConfigured(slotId: ApiKeySlotId) {
  return env.apiKeys[slotId].trim().length > 0;
}
