import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "node:path";

// Prisma 7 の `prisma.config.ts` は `.env` の自動読込より先に評価されることがあるため、
// ここで明示的に読み込む（`cd web` / `pnpm -C web ...` 実行を想定）。
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // fallback（必要なら）

export default defineConfig({
  // `web/` パッケージを起点にしたパス
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7 では `schema.prisma` に url を書けないため、ここで環境変数から渡す。
    // `DIRECT_DATABASE_URL` は任意（未設定でもOK）にしておく。
    url: process.env.DATABASE_URL ?? "",
    ...(process.env.DIRECT_DATABASE_URL
      ? { directUrl: process.env.DIRECT_DATABASE_URL }
      : {}),
  },
});

