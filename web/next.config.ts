import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// `web/` 配下の Next.js から、リポジトリルートの `.env` を優先して読むための明示ロード。
// Shopify CLI で起動していない場面（`pnpm -C web dev` など）でも env が揃う。
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
dotenv.config({ path: path.resolve(import.meta.dirname, ".env") }); // fallback（必要なら）

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  },
  // Prisma 7 の生成ファイルが Next.js の webpack バンドルと競合するため、
  // サーバーサイドの外部パッケージとして扱う
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
  // Prisma 7 の generated client が ESM スタイルの .js 拡張子でインポートするが、
  // 実際のファイルは .ts であるため、webpack の extensionAlias で .js → .ts を解決する
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".js", ".ts"],
    };
    return config;
  },
  // `HOST` が未設定の状態（Shopify CLI を使わずに起動する等）でも
  // Next.js の設定バリデーションで落ちないようにする。
  allowedDevOrigins: process.env.HOST ? [process.env.HOST] : [],
};

export default nextConfig;
