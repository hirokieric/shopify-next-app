/**
 * 必須環境変数を検証
 */
export function validateEnvVariables() {
  const requiredEnvVars = {
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
    HOST: process.env.HOST,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  const missingVars: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === "") {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `以下の必須環境変数が設定されていません: ${missingVars.join(", ")}`,
    );
  }
}

