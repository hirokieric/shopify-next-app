import "@shopify/shopify-api/adapters/web-api";
import { shopifyApi, LogSeverity } from "@shopify/shopify-api";
import { validateEnvVariables } from "@/lib/env-validation";
import { SHOPIFY_API_VERSION } from "./constants";

import logger from "@/lib/logger";

// 環境変数を検証
try {
  validateEnvVariables();
} catch (error) {
  logger.fatal({ err: error }, "環境変数の検証に失敗しました");
  throw error;
}

const apiKey = process.env.SHOPIFY_API_KEY!;
const apiSecretKey = process.env.SHOPIFY_API_SECRET!;
const hostName = process.env.HOST!.replace(/https?:\/\//, "");
const scopes = process.env.SCOPES?.split(",") || ["write_products"];

const shopify = shopifyApi({
  apiKey,
  apiSecretKey,
  scopes,
  hostName,
  hostScheme: "https",
  isEmbeddedApp: true,
  apiVersion: SHOPIFY_API_VERSION,
  logger: {
    level:
      process.env.NODE_ENV === "development"
        ? LogSeverity.Debug
        : LogSeverity.Error,
  },
});

export default shopify;
