import "@shopify/shopify-api/adapters/web-api";
import { shopifyApi, ApiVersion, LogSeverity } from "@shopify/shopify-api";
import { validateEnvVariables } from "@/lib/env-validation";

// 環境変数を検証
try {
  validateEnvVariables();
} catch (error) {
  console.error("環境変数の検証に失敗しました:", error);
  throw error;
}

const apiKey = process.env.SHOPIFY_API_KEY!;
const apiSecretKey = process.env.SHOPIFY_API_SECRET!;
const hostName = process.env.HOST!.replace(/https?:\/\//, "");
const scopes = process.env.SCOPES?.split(",") || ["write_products"];

if (!apiKey || !apiSecretKey || !hostName) {
  throw new Error(
    "SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST は必須の環境変数です",
  );
}

const shopify = shopifyApi({
  apiKey,
  apiSecretKey,
  scopes,
  hostName,
  hostScheme: "https",
  isEmbeddedApp: true,
  apiVersion: ApiVersion.October25,
  logger: {
    level:
      process.env.NODE_ENV === "development"
        ? LogSeverity.Debug
        : LogSeverity.Error,
  },
});

export default shopify;
