import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Next の shareable config を flat config で利用するための互換レイヤ
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "public/**",
      ".turbo/**",
      "coverage/**",
      "prisma/migrations/**",
      "generated/**",
      "lib/gql/**",
      "types/admin.generated.d.ts",
      ".next/types/**",
    ],
  },

  // Next.js 推奨 + prettier で整形衝突を回避
  ...compat.extends("next/core-web-vitals", "prettier"),

  // 追加ルール（主に TS と運用のため）
  {
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      // 運用: console は info/warn/error のみに制限（log/debug は禁止）
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],

      // TS では eslint の no-unused-vars は無効にして TS 用を使う
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "prefer-const": "warn",
      "no-var": "error",
    },
  },
];

export default config;
