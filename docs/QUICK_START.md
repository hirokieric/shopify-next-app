# Quick Start Guide

このテンプレートをローカルで動かすまでの最短手順です。

## 前提条件

| ツール | バージョン | インストール |
|--------|-----------|-------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 9+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| Docker | — | [docker.com](https://www.docker.com/) |
| Shopify CLI | latest | `npm install -g @shopify/cli` |

Shopify Partners アカウントと開発ストアも必要です。

---

## 1. セットアップ (初回のみ)

```bash
# リポジトリをクローン
git clone https://github.com/ozzyonfire/shopify-next-app.git
cd shopify-next-app

# 依存パッケージをインストール (Prisma Client も自動生成される)
pnpm install

# 環境変数ファイルを作成
cp .env.example .env
```

`.env` を編集して最低限以下を設定:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/shopify_app
POSTGRES_PASSWORD=password
```

> `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `HOST` は Shopify CLI が自動設定するため、手動設定は不要です。

---

## 2. DB 起動 & マイグレーション

```bash
# PostgreSQL コンテナを起動
docker-compose up -d

# マイグレーションを実行
pnpm -C web migrate
```

---

## 3. 開発サーバー起動

```bash
pnpm run dev
```

Shopify CLI が以下を自動で行います:
- 環境変数 (`SHOPIFY_API_KEY` 等) の注入
- Cloudflare トンネルの作成
- Next.js 開発サーバーの起動 (port 3000)

起動後、ターミナルに表示される URL から開発ストアの管理画面でアプリを確認できます。

---

## よく使うコマンド

| やりたいこと | コマンド |
|-------------|---------|
| 開発サーバー起動 | `pnpm run dev` |
| DB 起動 | `docker-compose up -d` |
| DB マイグレーション | `pnpm -C web migrate` |
| GraphQL 型生成 | `pnpm -C web graphql-codegen` |
| テスト実行 | `pnpm -C web test` |
| テスト (ウォッチ) | `pnpm -C web test:watch` |
| Lint + 型チェック | `pnpm run check` |
| フォーマット修正 | `pnpm run format:write` |

---

## プロジェクト構成 (主要ファイル)

```
shopify-next-app/
├── .env                    # 環境変数 (git管理外)
├── docker-compose.yml      # ローカル PostgreSQL
├── shopify.app.toml        # Shopify アプリ設定
└── web/                    # Next.js アプリケーション
    ├── app/
    │   ├── layout.tsx      # ルートレイアウト (App Bridge + Polaris)
    │   ├── page.tsx        # トップページ
    │   ├── providers/      # SessionProvider, TanstackProvider
    │   ├── hooks/          # useGraphQL 等
    │   └── api/
    │       └── webhooks/   # Webhook エンドポイント
    ├── lib/
    │   ├── shopify/        # Shopify API 初期化・認証・Webhook
    │   ├── db/             # Prisma 接続・セッション管理
    │   └── logger.ts       # pino ロガー
    └── prisma/
        └── schema.prisma   # DB スキーマ
```

---

## 新しいページを追加する

```bash
# 例: /products ページを追加
mkdir -p web/app/products
```

```tsx
// web/app/products/page.tsx
import { verifyRequest } from "@/lib/shopify/verify";
import ProductsClient from "./client.page";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  await verifyRequest(params);

  return <ProductsClient />;
}
```

```tsx
// web/app/products/client.page.tsx
"use client";

export default function ProductsClient() {
  return (
    <ui-page title="Products">
      <ui-card>
        <p>商品一覧</p>
      </ui-card>
    </ui-page>
  );
}
```

ポイント:
- `page.tsx` (Server Component) で `verifyRequest()` を呼び認証を検証
- UI ロジックは `client.page.tsx` (Client Component) に分離
- Polaris Web Components (`<ui-page>`, `<ui-card>` 等) を使用

---

## GraphQL クエリの追加

1. クエリを書く:

```tsx
import { graphql } from "@/lib/gql";

const GET_PRODUCTS = graphql(`
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`);
```

2. 型を生成:

```bash
pnpm -C web graphql-codegen
```

3. フックで使用:

```tsx
const { data, isLoading } = useGraphQL(GET_PRODUCTS, { first: 10 });
```

---

## Shopify API バージョンの更新

Shopify は四半期ごと (1月, 4月, 7月, 10月) に新しい API バージョンをリリースします。
古いバージョンはリリースから約12ヶ月後に廃止されるため、定期的な更新が必要です。

### 更新が必要なファイル (5箇所)

| # | ファイル | 変更内容 | 例 |
|---|---------|---------|-----|
| 1 | `web/lib/shopify/constants.ts` | `ApiVersion` enum | `ApiVersion.January26` |
| 2 | `shopify.app.toml` | `[webhooks].api_version` | `"2026-01"` |
| 3 | `shopify.app.app-next-vercel.toml` | `[webhooks].api_version` | `"2026-01"` |
| 4 | `web/codegen.ts` | スキーマURL | `.../admin-graphql-direct-proxy/2026-01` |
| 5 | `.graphqlrc.yml` | スキーマURL | `.../admin-graphql-direct-proxy/2026-01` |

> `useGraphQL.ts` と `client.page.tsx` は `constants.ts` の定数を参照しているため、個別の変更は不要です。

### 更新手順

```bash
# 1. @shopify/shopify-api で利用可能なバージョンを確認
#    web/node_modules/@shopify/shopify-api/dist/cjs/lib/types.js の ApiVersion enum を参照

# 2. 上記5ファイルをすべて更新

# 3. GraphQL 型を再生成
pnpm -C web graphql-codegen

# 4. 動作確認
pnpm run dev
```

> **注意**: `web/lib/gql/graphql.ts` は codegen で自動生成されるため、手動編集は不要です。

### バージョン命名規則

| リリース月 | API バージョン | ApiVersion Enum |
|-----------|--------------|-----------------|
| 1月 | `2026-01` | `ApiVersion.January26` |
| 4月 | `2026-04` | `ApiVersion.April26` |
| 7月 | `2026-07` | `ApiVersion.July26` |
| 10月 | `2026-10` | `ApiVersion.October26` |

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| DB 接続エラー | `docker ps` で PostgreSQL が起動しているか確認 |
| マイグレーションエラー | `pnpm -C web npx prisma migrate reset` で DB リセット (開発環境のみ) |
| 環境変数が効かない | `pnpm run dev` (Shopify CLI 経由) で起動しているか確認 |
| Polaris が表示されない | `layout.tsx` の CDN スクリプトを確認 |
| CSP エラー | `middleware.ts` のセキュリティヘッダー設定を確認 |

詳細は [README.md](../README.md) の Troubleshooting セクションを参照してください。
