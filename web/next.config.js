/** @type {import('next').NextConfig} */
// `web/` 配下の Next.js から、リポジトリルートの `.env` を優先して読むための明示ロード。
// Shopify CLI で起動していない場面（`pnpm -C web dev` など）でも env が揃う。
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, ".env") }); // fallback（必要なら）

const nextConfig = {
  env: {
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  },
  allowedDevOrigins: [process.env.HOST],
};

module.exports = nextConfig;
