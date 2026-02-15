import { ApiVersion } from "@shopify/shopify-api";

/**
 * Shopify API バージョン（一元管理）
 * initialize-context.ts と useGraphQL.ts の両方で参照される
 */
export const SHOPIFY_API_VERSION = ApiVersion.October25;
