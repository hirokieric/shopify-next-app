import { defineConfig } from "prisma/config";

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

