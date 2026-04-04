import nextConfig from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

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

  // Next.js 推奨（Flat Config ネイティブ対応 v16+）
  ...nextConfig,

  // prettier で整形衝突を回避
  prettierConfig,

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
