# Shopify App Template - Next.js App Router

Shopify の埋め込みアプリを **Next.js 15 (App Router)** で構築するためのテンプレートです。セッション管理、Webhook 処理、GraphQL コード生成、Prisma によるデータベース連携など、本番運用に必要な基盤を一通り備えています。

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. リポジトリのクローン](#1-リポジトリのクローン)
  - [2. 依存パッケージのインストール](#2-依存パッケージのインストール)
  - [3. 環境変数の設定](#3-環境変数の設定)
  - [4. データベースのセットアップ](#4-データベースのセットアップ)
  - [5. 開発サーバーの起動](#5-開発サーバーの起動)
- [Architecture](#architecture)
  - [ディレクトリ構成](#ディレクトリ構成)
  - [リクエストライフサイクル](#リクエストライフサイクル)
  - [認証フロー (Token Exchange)](#認証フロー-token-exchange)
  - [Providers](#providers)
  - [データベーススキーマ](#データベーススキーマ)
  - [Webhook 処理](#webhook-処理)
  - [GraphQL コード生成](#graphql-コード生成)
  - [エラーハンドリング](#エラーハンドリング)
  - [ロギング](#ロギング)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
  - [Vercel へのデプロイ](#vercel-へのデプロイ)
  - [shopify.app.toml の自動生成](#shopifyapptoml-の自動生成)
  - [Shopify CLI によるデプロイ](#shopify-cli-によるデプロイ)
- [Troubleshooting](#troubleshooting)
- [Developer Resources](#developer-resources)
- [License](#license)

---

## Key Features

- **Next.js 15 App Router** — Server Components / Server Actions をフル活用
- **Shopify App Bridge v4** — Managed インストールフロー & Direct API アクセス
- **Token Exchange** — セッショントークンの自動検証・交換
- **Prisma 7 + PostgreSQL** — セッション永続化 & マイグレーション管理
- **Polaris Web Components** — CDN 経由で読み込む Shopify 公式 UI コンポーネント
- **Tailwind CSS v4** — ユーティリティファーストなスタイリング
- **TanStack Query** — クライアントサイドの GraphQL データフェッチ
- **GraphQL Codegen** — Shopify Admin API の型安全なクエリ生成
- **Structured Logging** — pino による構造化ログ (`LOG_LEVEL` で制御)
- **Error Boundary** — `error.tsx` / `loading.tsx` によるグレースフルなエラー・ローディング UI
- **Vitest** — ユニットテスト基盤
- **Docker Compose** — ローカル開発用 PostgreSQL (healthcheck 付き)
- **GDPR Webhook** — 必須 Webhook (`CUSTOMERS_DATA_REQUEST`, `CUSTOMERS_REDACT`, `SHOP_REDACT`) をプリセット

---

## Tech Stack

| カテゴリ | 技術 |
|---|---|
| **Language** | TypeScript 5.9+ |
| **Framework** | Next.js 15 (App Router) |
| **Runtime** | React 19 |
| **UI** | Polaris Web Components (CDN), Tailwind CSS v4 |
| **State Management** | TanStack Query v5 |
| **Database** | PostgreSQL 17 |
| **ORM** | Prisma 7 (`@prisma/adapter-pg`) |
| **Shopify SDK** | `@shopify/shopify-api` v12, `@shopify/app-bridge-react` v4 |
| **GraphQL** | `graphql-request`, `@graphql-codegen/cli` |
| **Logging** | pino |
| **Testing** | Vitest |
| **Package Manager** | pnpm (workspace) |
| **Linting** | ESLint 9, Prettier |

---

## Prerequisites

- **Node.js** 20 以上
- **pnpm** 9 以上
- **PostgreSQL 15+** (または Docker)
- **Shopify CLI** — `npm install -g @shopify/cli`
- **Shopify Partners アカウント** — アプリの作成に必要
- **開発ストア** — テスト用の Shopify ストア
- (任意) **Cloudflare Tunnel** — `cloudflared` CLI でローカルトンネルを張る場合

---

## Getting Started

### 1. リポジトリのクローン

Shopify CLI のテンプレートとしてインストールする場合:

```bash
pnpx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
cd shopify-next-app
```

手動でクローンする場合:

```bash
git clone https://github.com/ozzyonfire/shopify-next-app.git
cd shopify-next-app
```

### 2. 依存パッケージのインストール

```bash
pnpm install
```

`web/package.json` の `postinstall` スクリプトにより、Prisma Client が自動的に生成されます。

### 3. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成します:

```bash
cp .env.example .env
```

必要な値を埋めてください。主要な設定:

```bash
# === Shopify (Shopify CLI 使用時は自動設定) ===
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products
HOST=https://your-tunnel-url.trycloudflare.com

# === Database ===
DATABASE_URL=postgresql://postgres:password@localhost:5432/shopify_app
POSTGRES_PASSWORD=password
```

> **Note**: Shopify CLI (`pnpm run dev`) で起動すると `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `HOST` は自動的に設定されます。手動で設定が必要なのは `DATABASE_URL` と `POSTGRES_PASSWORD` のみです。

### 4. データベースのセットアップ

#### Docker を使う場合 (推奨)

```bash
# PostgreSQL コンテナを起動
docker-compose up -d

# マイグレーションを実行
pnpm -C web migrate
```

#### 既存の PostgreSQL を使う場合

`.env` の `DATABASE_URL` を既存のデータベースに向けて設定し、マイグレーションを実行します:

```bash
pnpm -C web migrate
```

### 5. 開発サーバーの起動

```bash
# Shopify CLI 経由 (推奨 — 環境変数を自動設定、トンネルも管理)
pnpm run dev

# Next.js のみ直接起動する場合
pnpm -C web dev
```

Shopify CLI 経由で起動すると、ブラウザで開発ストアの管理画面からアプリにアクセスできます。

---

## Architecture

### ディレクトリ構成

```
shopify-next-app/
├── .env.example                  # 環境変数のサンプル
├── .env                          # 環境変数 (gitignore)
├── docker-compose.yml            # ローカル PostgreSQL
├── package.json                  # ルートワークスペース設定
├── pnpm-workspace.yaml           # pnpm ワークスペース定義
├── shopify.app.toml              # Shopify アプリ設定
├── shopify.app.app-next-vercel.toml  # Vercel デプロイ用設定
├── scripts/
│   └── generate-shopify-app-toml.cjs # .env → shopify.app.toml 変換
├── _developer/                   # Shopify CLI 内部ユーティリティ
│   ├── declarativeWriter.js
│   ├── tomlWriter.js
│   └── webhookWriter.js
├── docs/                         # プロジェクトドキュメント
│   ├── README.md
│   ├── README_JA.md
│   ├── SETUP_JA.md
│   ├── TEMPLATE_FEATURES_JA.md
│   └── TEMPLATE_SPEC_JA.md
└── web/                          # Next.js アプリケーション
    ├── app/
    │   ├── layout.tsx            # ルートレイアウト (App Bridge + Polaris CDN)
    │   ├── page.tsx              # トップページ (Server Component)
    │   ├── client.page.tsx       # トップページ UI (Client Component)
    │   ├── actions.ts            # Server Actions
    │   ├── error.tsx             # エラーバウンダリ
    │   ├── loading.tsx           # ローディング UI
    │   ├── globals.css           # グローバルスタイル (Tailwind)
    │   ├── hooks/
    │   │   └── useGraphQL.ts     # TanStack Query + GraphQL フック
    │   ├── providers/
    │   │   ├── providers.tsx     # プロバイダー統合
    │   │   ├── session-provider.tsx  # セッション & Webhook 登録 (リトライ付き)
    │   │   └── tanstack-provider.tsx # TanStack Query + DevTools
    │   ├── settings/
    │   │   ├── page.tsx          # 設定ページ
    │   │   ├── client.page.tsx   # 設定フォーム UI
    │   │   └── actions.ts        # 設定用 Server Actions
    │   ├── new/
    │   │   └── page.tsx          # サンプルページ
    │   └── api/
    │       ├── hello/route.ts    # サンプル API エンドポイント
    │       └── webhooks/route.ts # Webhook 受信エンドポイント
    ├── lib/
    │   ├── shopify/
    │   │   ├── initialize-context.ts  # Shopify API 初期化
    │   │   ├── constants.ts           # API バージョン等の定数
    │   │   ├── verify.ts              # トークン検証 & Token Exchange
    │   │   ├── register-webhooks.ts   # Webhook ハンドラー登録
    │   │   └── gdpr.ts                # GDPR 必須 Webhook
    │   ├── db/
    │   │   ├── prisma-connect.ts      # Prisma クライアントシングルトン (プール設定可)
    │   │   ├── session-storage.ts     # セッション CRUD
    │   │   └── app-installations.ts   # アプリインストール確認
    │   ├── errors/
    │   │   ├── api-error.ts           # API エラーハンドリング
    │   │   └── session-errors.ts      # セッション関連エラークラス
    │   ├── types/
    │   │   └── api.ts                 # API レスポンス共通型
    │   ├── logger.ts                  # pino ロガー
    │   ├── env-validation.ts          # 環境変数バリデーション
    │   ├── __tests__/                 # ユニットテスト
    │   │   └── env-validation.test.ts
    │   ├── get-products.ts            # GraphQL クエリ例
    │   └── gql/                       # GraphQL Codegen 出力
    ├── prisma/
    │   ├── schema.prisma              # Prisma スキーマ (@@index 付き)
    │   └── migrations/                # マイグレーションファイル
    ├── prisma.config.ts               # Prisma 7 設定
    ├── generated/prisma/              # Prisma Client 生成コード
    ├── types/
    │   ├── env.d.ts                   # 環境変数の型定義
    │   ├── admin.generated.d.ts       # Shopify Admin API 型
    │   └── polaris-web-components.d.ts # Polaris Web Components JSX 型
    ├── middleware.ts                   # セキュリティヘッダー (CSP, HSTS 等)
    ├── codegen.ts                     # GraphQL Codegen 設定
    ├── next.config.ts                 # Next.js 設定 (TypeScript)
    ├── vitest.config.ts               # Vitest 設定
    ├── tsconfig.json                  # TypeScript 設定
    └── shopify.web.toml               # Shopify Web コンポーネント設定
```

### リクエストライフサイクル

```
ユーザー操作
  → React Component (Client)
  → App Bridge が Bearer トークンを自動付与
  → Next.js API Route / Server Action
  → verifyRequest() でトークン検証
  → Token Exchange (必要に応じて)
  → Shopify Admin API / Prisma DB
  → JSON レスポンス / Server Action 戻り値
  → UI 更新
```

### 認証フロー (Token Exchange)

このテンプレートは **Token Exchange** パターンを採用しています:

1. **初回ロード**: `SessionProvider` が App Bridge から ID Token を取得
2. **トークン保存**: Server Action `storeToken()` で Token Exchange を実行し、アクセストークンを DB に保存
3. **Webhook 登録**: Server Action `doWebhookRegistration()` で Webhook を登録
4. **API リクエスト**: App Bridge が `fetch` に Bearer トークンを自動付与 → `verifyRequest()` で検証

App Bridge v4 の Direct API モードにより、`shopify:admin/api/graphql.json` を使ったクライアントサイドからの直接 GraphQL アクセスも可能です。

### Providers

`app/providers/providers.tsx` で以下のプロバイダーを統合:

| Provider | 役割 |
|---|---|
| `TanstackProvider` | TanStack Query クライアント (staleTime 60s, gcTime 5m, retry 2)。開発時は DevTools 付き |
| `SessionProvider` | 初回ロード時にトークン保存 & Webhook 登録を実行。失敗時はリトライ (最大3回、指数バックオフ)。エラー時はバナー UI を表示 |

App Bridge は `layout.tsx` で CDN スクリプトとして読み込まれます。

### データベーススキーマ

```
Session
├── id (UUID, PK)
├── accessToken (String?)
├── expires (DateTime?)
├── isOnline (Boolean)
├── scope (String?)
├── shop (String)
├── state (String)
├── apiKey (String)
├── createdAt / updatedAt
└── onlineAccessInfo → OnlineAccessInfo (1:1)

OnlineAccessInfo
├── id (UUID, PK)
├── sessionId (FK → Session, unique)
├── expiresIn (Int)
├── associatedUserScope (String)
├── createdAt / updatedAt
└── associatedUser → AssociatedUser (1:1)

AssociatedUser
├── id (UUID, PK)
├── onlineAccessInfoId (FK → OnlineAccessInfo, unique)
├── userId (BigInt)
├── firstName / lastName / email
├── accountOwner / collaborator / emailVerified (Boolean)
├── locale (String)
└── createdAt / updatedAt
```

### Webhook 処理

`POST /api/webhooks` で全 Webhook を受信。ハンドラーは `lib/shopify/register-webhooks.ts` で登録されます。

| Webhook | 処理 |
|---|---|
| `APP_UNINSTALLED` | ショップのセッションデータを削除 |
| `CUSTOMERS_DATA_REQUEST` | 顧客データリクエスト (GDPR) |
| `CUSTOMERS_REDACT` | 顧客データ削除 (GDPR) |
| `SHOP_REDACT` | ショップデータ削除 (GDPR) |

### GraphQL コード生成

Shopify Admin API の型を自動生成します:

```bash
pnpm -C web graphql-codegen
```

- **入力**: `app/`, `components/`, `hooks/`, `lib/` 内の `graphql()` タグ付きクエリ
- **出力**: `lib/gql/` (クライアントプリセット) と `types/admin.generated.d.ts` (Shopify API 型)
- **スキーマ**: `https://shopify.dev/admin-graphql-direct-proxy/2025-10`

クライアントサイドでは `useGraphQL` フックで型安全にクエリを実行できます:

```tsx
import { graphql } from "@/lib/gql";
import { useGraphQL } from "./hooks/useGraphQL";

const GET_SHOP = graphql(`
  query getShop {
    shop { name }
  }
`);

const { data, isLoading } = useGraphQL(GET_SHOP);
// data.shop.name は string 型として推論される
```

### エラーハンドリング

API ルートでは `handleApiError()` を使用して、セッション関連エラーを適切な HTTP ステータスコードに変換します:

| エラークラス | HTTP ステータス | コード |
|---|---|---|
| `AppNotInstalledError` | 401 | `APP_NOT_INSTALLED` |
| `SessionNotFoundError` | 401 | `SESSION_NOT_FOUND` |
| `ExpiredTokenError` | 401 | `TOKEN_EXPIRED` |
| `ScopeMismatchError` | 403 | `SCOPE_MISMATCH` |
| その他 | 500 | `UNKNOWN_ERROR` |

本番環境では詳細なエラーメッセージは隠蔽されます。

Next.js の `error.tsx` がキャッチされなかったエラーをグレースフルに表示し、`loading.tsx` がページ遷移中のローディング UI を提供します。

### ロギング

pino による構造化ログを使用しています (`lib/logger.ts`)。

```typescript
import logger from "@/lib/logger";

logger.info({ shop }, "Webhook processed");
logger.error({ err: error }, "API error");
```

| 環境 | デフォルトレベル | 出力形式 |
|---|---|---|
| development | `debug` | 人間が読みやすい形式 (pino/file) |
| production | `info` | JSON (構造化ログ) |

`LOG_LEVEL` 環境変数でレベルを上書き可能です。

---

## Testing

Vitest でユニットテストを実行します。

```bash
# テスト実行
pnpm -C web test

# ウォッチモード
pnpm -C web test:watch
```

テストファイルは `__tests__/` ディレクトリに `*.test.ts` / `*.test.tsx` として配置します。`@/` パスエイリアスが Vitest でも利用可能です。

---

## Environment Variables

### 必須

| 変数 | 説明 | 取得方法 |
|---|---|---|
| `SHOPIFY_API_KEY` | Shopify アプリの API キー | Shopify Partners Dashboard → App → API credentials |
| `SHOPIFY_API_SECRET` | Shopify アプリの API シークレット | 同上 |
| `HOST` | アプリの公開 URL | Shopify CLI が自動設定、または手動で設定 |
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgresql://user:password@host:port/dbname` |

### 任意

| 変数 | 説明 | デフォルト |
|---|---|---|
| `SCOPES` | Shopify API スコープ (カンマ区切り) | `write_products` |
| `DIRECT_DATABASE_URL` | Prisma の Direct URL (接続プーリング回避) | — |
| `DATABASE_POOL_SIZE` | DB コネクションプールの最大サイズ | `5` |
| `POSTGRES_PASSWORD` | Docker Compose 用の PostgreSQL パスワード | — |
| `LOG_LEVEL` | ログレベル (debug, info, warn, error, fatal) | dev: `debug`, prod: `info` |
| `NODE_ENV` | 実行環境 | `development` |

### shopify.app.toml 生成用 (任意)

| 変数 | 説明 |
|---|---|
| `SHOPIFY_APP_URL` | アプリの公開 URL |
| `APP_NAME` | アプリ名 |
| `SHOPIFY_API_SCOPES` | API スコープ |
| `SHOPIFY_API_VERSION` | Webhook API バージョン |
| `SHOPIFY_DEV_STORE_URL` | 開発ストアの URL |

### 環境変数の読み込み順序

`next.config.ts` と `prisma.config.ts` は以下の順序で `.env` を読み込みます:

1. リポジトリルートの `.env` (優先)
2. `web/.env` (フォールバック)

---

## Available Scripts

### ルート (`package.json`)

| コマンド | 説明 |
|---|---|
| `pnpm run dev` | Shopify CLI 経由で開発サーバー起動 |
| `pnpm run build` | Shopify CLI 経由でビルド |
| `pnpm run deploy` | Shopify CLI 経由でデプロイ |
| `pnpm run tunnel` | Cloudflare Tunnel 起動 |
| `pnpm run sync:shopify-app-toml` | `.env` から `shopify.app.toml` を再生成 |
| `pnpm run lint` | ESLint 実行 |
| `pnpm run lint:fix` | ESLint 自動修正 |
| `pnpm run typecheck` | TypeScript 型チェック |
| `pnpm run format` | Prettier フォーマットチェック |
| `pnpm run format:write` | Prettier 自動フォーマット |
| `pnpm run check` | lint + typecheck + format 一括実行 |

### Web パッケージ (`web/package.json`)

| コマンド | 説明 |
|---|---|
| `pnpm -C web dev` | Next.js 開発サーバー起動 (port 3000) |
| `pnpm -C web build` | Next.js プロダクションビルド |
| `pnpm -C web migrate` | Prisma マイグレーション実行 |
| `pnpm -C web graphql-codegen` | GraphQL 型生成 |
| `pnpm -C web lint` | ESLint 実行 |
| `pnpm -C web typecheck` | TypeScript 型チェック |
| `pnpm -C web test` | Vitest テスト実行 |
| `pnpm -C web test:watch` | Vitest ウォッチモード |

---

## Deployment

### Vercel へのデプロイ

1. Shopify Partners Dashboard でアプリを作成
2. Vercel にプロジェクトを作成し、環境変数を設定:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SCOPES`
   - `HOST` (Vercel のデプロイ URL)
   - `DATABASE_URL` (マネージド PostgreSQL の接続文字列)
3. Shopify アプリの設定で redirect URL を更新:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/auth/shopify/callback`
   - `https://your-app.vercel.app/api/auth/callback`
4. ビルド設定:
   - **Root Directory**: `web`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next`

> `shopify.app.app-next-vercel.toml` に Vercel デプロイ用のサンプル設定が含まれています。

### shopify.app.toml の自動生成

`.env` の値から `shopify.app.toml` を自動生成できます:

```bash
# 生成
pnpm run sync:shopify-app-toml

# CI で差分チェック
node scripts/generate-shopify-app-toml.cjs --check
```

### Shopify CLI によるデプロイ

Managed deployment を使用してスコープ変更を自動処理します:

```bash
pnpm run deploy
```

---

## Troubleshooting

### データベース接続エラー

**エラー**: `Can't reach database server`

```bash
# Docker が起動しているか確認
docker ps

# コンテナを起動
docker-compose up -d

# DATABASE_URL が正しいか確認
echo $DATABASE_URL
```

### Prisma マイグレーションエラー

**エラー**: `P3009: migrate found failed migrations`

```bash
# マイグレーション状態を確認
pnpm -C web npx prisma migrate status

# 開発環境のみ: DB をリセット
pnpm -C web npx prisma migrate reset
```

### 環境変数が読み込まれない

Shopify CLI を使わずに `pnpm -C web dev` で直接起動した場合:

- リポジトリルートの `.env` が読み込まれることを確認
- `next.config.ts` が `dotenv.config()` でルートの `.env` を明示的に読み込んでいます

### CSP (Content-Security-Policy) エラー

`middleware.ts` が `frame-ancestors` ヘッダーを設定しています。`shop` パラメータが URL に含まれていない場合、`*.myshopify.com` がデフォルトで使用されます。`shop` パラメータは正規表現 (`/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/`) でバリデーションされます。

`middleware.ts` は CSP 以外にも以下のセキュリティヘッダーを設定します:

- `Strict-Transport-Security` (HSTS, 1年)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` (camera, microphone, geolocation を無効化)

### Webhook が処理されない

サーバーレス環境では Webhook ハンドラーが登録されていない場合があります。`webhooks/route.ts` はハンドラーが見つからない場合に自動で `addHandlers()` を呼び出します。

### Polaris Web Components が表示されない

`layout.tsx` で CDN スクリプトが読み込まれていることを確認:

```html
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
<script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
```

---

## Developer Resources

- [Shopify App Development](https://shopify.dev/apps/getting-started)
- [Shopify App Bridge v4](https://shopify.dev/docs/api/app-bridge-library)
- [Shopify Admin API (GraphQL)](https://shopify.dev/docs/api/admin-graphql)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API Library (Node.js)](https://github.com/Shopify/shopify-api-js)
- [Polaris Web Components](https://polaris.shopify.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query)

---

## License

MIT
