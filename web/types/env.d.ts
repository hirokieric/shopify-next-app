declare namespace NodeJS {
  interface ProcessEnv {
    // Shopify 設定
    SHOPIFY_API_KEY: string;
    SHOPIFY_API_SECRET: string;
    SCOPES?: string;
    HOST: string;

    // データベース
    DATABASE_URL: string;
    DIRECT_DATABASE_URL?: string;

    // Next.js
    NODE_ENV: "development" | "production" | "test";
    NEXT_PUBLIC_HOST?: string;
    NEXT_PUBLIC_SHOPIFY_API_KEY?: string;
  }
}

