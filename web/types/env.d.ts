/// <reference path="./polaris-web-components.d.ts" />

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

// Shopify Polaris Web Components (`<s-*>`) in TSX
declare namespace JSX {
  interface IntrinsicElements {
    "s-page": any;
    "s-card": any;
    "s-text": any;
    "s-button": any;
    [elemName: string]: any;
  }
}
