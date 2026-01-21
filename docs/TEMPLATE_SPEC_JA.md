# Shopify Next.js App Router テンプレート仕様書

このドキュメントでは、この Shopify アプリテンプレートの構造、認証フロー、データベース設計、Webhook 処理など、開発者が理解すべき技術仕様について説明します。

## 📋 目次

1. [テンプレートの概要](#テンプレートの概要)
2. [ディレクトリ構成と責務](#ディレクトリ構成と責務)
3. [認証・セッション管理](#認証セッション管理)
4. [Webhook 処理](#webhook-処理)
5. [データベース設計](#データベース設計)
6. [セキュリティ・CSP](#セキュリティcsp)
7. [ローカル開発フロー](#ローカル開発フロー)
8. [よくある落とし穴](#よくある落とし穴)

---

## テンプレートの概要

### 目的

このテンプレートは、**Next.js App Router** と **App Bridge v4** を使用して Shopify 埋め込みアプリを構築するための基盤を提供します。

**このテンプレートが提供するもの:**
- Next.js App Router によるサーバーコンポーネントベースの開発環境
- App Bridge v4 による Direct API Mode（オフラインアクセストークン）の認証フロー
- Token Exchange による簡潔な認証・セッション管理
- Prisma による型安全なデータベース接続（PostgreSQL）
- Tanstack Query による GraphQL データフェッチング
- GraphQL Codegen による型生成
- Webhook の登録・受信処理

**このテンプレートが提供しないもの:**
- 既存の Shopify テンプレートとの完全な互換性保証
- 公式 Shopify サポート（コミュニティベース）
- ビジネスロジックの実装例（基本構造のみ）

### 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フロントエンド | Next.js | 15.5.9 | App Router フレームワーク |
| フロントエンド | React | 19.2.0 | UI ライブラリ |
| フロントエンド | TypeScript | 5.9.3 | 型安全性 |
| フロントエンド | Polaris Web Components | Shopify CDN | Shopify UI コンポーネント（`<s-*>`） |
| フロントエンド | Tailwind CSS | 4.1.14 | スタイリング |
| データフェッチング | Tanstack Query | 5.90.2 | GraphQL クエリ管理 |
| Shopify 統合 | App Bridge React | 4.2.5 | 埋め込みアプリ認証 |
| Shopify 統合 | Shopify API | 12.0.0 | サーバー側 API 連携 |
| データベース | Prisma | 6.19.1 | ORM |
| データベース | PostgreSQL | 17 | セッション・アプリデータ保存 |
| 型生成 | GraphQL Codegen | 5.0.7 | GraphQL 型生成 |

### 主要設定（shopify.app.toml）

```toml
[access.admin]
direct_api_mode = "offline"                    # オフラインアクセストークンを使用
embedded_app_direct_api_access = true          # 埋め込みアプリで Direct API アクセスを有効化

[access_scopes]
scopes = "read_products,write_products"        # アプリが要求するスコープ
use_legacy_install_flow = false                # 新しいインストールフローを使用
```

---

## ディレクトリ構成と責務

### ルートディレクトリ

```
ark-shopify-app/
├── web/                    # Next.js アプリケーション（メイン実装）
├── scripts/                # ビルド・デプロイ用スクリプト
├── docker-compose.yml      # ローカル PostgreSQL 設定
├── shopify.app.toml        # Shopify CLI 設定
├── package.json            # ルートパッケージ（CLI スクリプト定義）
└── pnpm-workspace.yaml     # pnpm ワークスペース設定
```

### web/ ディレクトリ（Next.js アプリ）

```
web/
├── app/                    # Next.js App Router ページ・ルート
│   ├── layout.tsx          # ルートレイアウト（App Bridge / Polaris Web Components スクリプト読み込み）
│   ├── page.tsx            # トップページ
│   ├── actions.ts          # サーバーアクション（認証・Webhook 登録）
│   ├── providers/          # React プロバイダー
│   │   ├── providers.tsx   # プロバイダー統合（Tanstack, Session）
│   │   ├── session-provider.tsx  # セッショントークン取得・保存
│   │   └── tanstack-provider.tsx # Tanstack Query プロバイダー
│   ├── api/                # API ルート
│   │   └── webhooks/       # Webhook 受信エンドポイント
│   └── hooks/              # カスタム React フック
│       └── useGraphQL.ts   # GraphQL クエリ用フック
├── lib/                    # ビジネスロジック・ユーティリティ
│   ├── shopify/            # Shopify API 関連
│   │   ├── initialize-context.ts  # Shopify API インスタンス初期化
│   │   ├── verify.ts              # トークン検証・交換
│   │   ├── register-webhooks.ts   # Webhook 登録
│   │   └── gdpr.ts                # GDPR Webhook 処理
│   ├── db/                 # データベース関連
│   │   ├── prisma-connect.ts      # Prisma クライアント接続
│   │   ├── session-storage.ts     # セッション保存・取得
│   │   └── app-installations.ts   # アプリインストール情報管理
│   └── gql/                # GraphQL コード生成関連
├── prisma/                 # Prisma スキーマ・マイグレーション
│   ├── schema.prisma       # データベーススキーマ定義
│   └── migrations/         # マイグレーションファイル
├── middleware.ts           # Next.js ミドルウェア（CSP ヘッダー設定）
├── codegen.ts              # GraphQL Codegen 設定
└── package.json            # web パッケージの依存関係
```

### 主要ファイルの責務

| ファイル | 責務 |
|---------|------|
| `web/app/layout.tsx` | App Bridge スクリプト読み込み、プロバイダー統合 |
| `web/app/providers/session-provider.tsx` | App Bridge から ID トークン取得、サーバーアクションで保存 |
| `web/app/actions.ts` | サーバーアクション（トークン保存、Webhook 登録） |
| `web/lib/shopify/initialize-context.ts` | Shopify API インスタンスの初期化（環境変数検証含む） |
| `web/lib/shopify/verify.ts` | セッショントークンの検証・交換（Token Exchange） |
| `web/lib/db/session-storage.ts` | Prisma を使ったセッションの永続化（upsert） |
| `web/middleware.ts` | CSP（Content Security Policy）ヘッダー設定（埋め込みアプリ用） |
| `web/app/api/webhooks/route.ts` | Webhook 受信エンドポイント（POST） |
| `web/lib/shopify/register-webhooks.ts` | Webhook ハンドラ登録・Shopify への登録リクエスト |

---

## 認証・セッション管理

### Token Exchange フロー

このテンプレートは、**Token Exchange** を使用した認証フローを採用しています。従来の OAuth フローと比較して、よりシンプルでモダンな実装になっています。

#### 認証フロー（シーケンス図）

```mermaid
sequenceDiagram
  participant Merchant as マーチャント管理画面
  participant NextApp as Next.js App (web)
  participant AppBridge as App Bridge v4
  participant ServerAction as Server Action (actions.ts)
  participant Verify as Token Exchange (verify.ts)
  participant ShopifyAPI as Shopify API
  participant DB as PostgreSQL (Prisma)

  Merchant->>NextApp: 埋め込みアプリ iframe 読み込み
  NextApp->>AppBridge: app.idToken()
  AppBridge-->>NextApp: sessionIdToken (JWT)
  NextApp->>ServerAction: storeToken(sessionIdToken)
  ServerAction->>Verify: handleSessionToken(sessionIdToken)
  Verify->>Verify: decodeSessionToken (JWT 検証)
  Note over Verify: shop = payload.dest.replace("https://", "")
  Verify->>ShopifyAPI: auth.tokenExchange(shop, sessionToken, offline)
  Note over ShopifyAPI: オフラインアクセストークンを要求
  ShopifyAPI-->>Verify: { session: Session }
  Verify->>DB: storeSession(session) (Prisma upsert)
  Note over DB: Session, OnlineAccessInfo, AssociatedUser を保存
  DB-->>Verify: upsert 完了
  Verify-->>ServerAction: { shop, session }
  ServerAction-->>NextApp: 成功
```

#### 実装の詳細

**1. クライアント側（SessionProvider）**

```12:30:web/app/providers/session-provider.tsx
"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { doWebhookRegistration, storeToken } from "../actions";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useAppBridge();

  useEffect(() => {
    app.idToken().then((token) => {
      storeToken(token)
        .then(() => {
          console.log("Token stored");
        })
        .catch((error) => {
          console.error("Error storing token", error);
        });
      doWebhookRegistration(token)
        .then(() => {
          console.log("Webhook registered");
        })
        .catch((error) => {
          console.error("Error registering webhook", error);
        });
    });
  }, [app]);

  return <>{children}</>;
}
```

- `useEffect` で App Bridge の `app.idToken()` を呼び出し、セッション ID トークン（JWT）を取得
- `storeToken` サーバーアクションでトークンを保存
- `doWebhookRegistration` サーバーアクションで Webhook を登録

**2. サーバー側（Server Actions）**

```40:47:web/app/actions.ts
export async function storeToken(sessionToken: string): Promise<void> {
  try {
    await handleSessionToken(sessionToken, false, true);
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
}
```

- `handleSessionToken` にセッショントークンを渡す
- 第2引数 `false` = オフラインアクセストークンを要求
- 第3引数 `true` = データベースにセッションを保存

**3. Token Exchange 処理**

```60:69:web/lib/shopify/verify.ts
export async function handleSessionToken(
  sessionToken: string,
  online?: boolean,
  store?: boolean,
): Promise<{ shop: string; session: Session }> {
  const payload = await shopify.session.decodeSessionToken(sessionToken);
  const shop = payload.dest.replace("https://", "");
  const session = await tokenExchange({ shop, sessionToken, online, store });
  return { shop, session };
}
```

- `decodeSessionToken` で JWT を検証・デコード
- `payload.dest` から `shop` ドメインを抽出
- `tokenExchange` で Shopify API にアクセストークンを要求

```29:52:web/lib/shopify/verify.ts
export async function tokenExchange({
  shop,
  sessionToken,
  online,
  store,
}: {
  shop: string;
  sessionToken: string;
  online?: boolean;
  store?: boolean;
}): Promise<Session> {
  const response = await shopify.auth.tokenExchange({
    shop,
    sessionToken,
    requestedTokenType: online
      ? RequestedTokenType.OnlineAccessToken
      : RequestedTokenType.OfflineAccessToken,
  });
  const { session } = response;
  if (store) {
    await storeSession(session);
  }
  return session;
}
```

### オンライン/オフラインアクセストークン

| トークン種別 | 用途 | 有効期限 | 用途例 |
|------------|------|---------|--------|
| **オフラインアクセストークン** | アプリがバックグラウンドで実行する処理 | 無期限（アプリがアンインストールされるまで） | バッチ処理、Webhook 処理、定期実行タスク |
| **オンラインアクセストークン** | 特定のユーザーの操作を実行する処理 | 1時間 | ユーザーの操作に応じた即時処理 |

このテンプレートはデフォルトで **オフラインアクセストークン** を使用します（`direct_api_mode = "offline"`）。

### セッションの永続化

セッションは Prisma を使用して PostgreSQL に保存されます。詳細は [データベース設計](#データベース設計) を参照してください。

---

## Webhook 処理

### Webhook 登録フロー

アプリインストール時（またはセッション確立時）に、Webhook が自動的に登録されます。

**登録タイミング:**
1. `SessionProvider` の `useEffect` で `doWebhookRegistration` が呼ばれる
2. サーバーアクション `doWebhookRegistration` が `registerWebhooks` を実行
3. `registerWebhooks` が Webhook ハンドラを登録し、Shopify API に登録リクエストを送信

**登録される Webhook:**

| Webhook トピック | ハンドラ | 用途 |
|----------------|---------|------|
| `APP_UNINSTALLED` | `register-webhooks.ts` | アプリアンインストール時にセッションをクリーンアップ |
| `CUSTOMERS_DATA_REQUEST` | `gdpr.ts` | GDPR 対応（顧客データ要求） |
| `CUSTOMERS_REDACT` | `gdpr.ts` | GDPR 対応（顧客データ削除要求） |
| `SHOP_REDACT` | `gdpr.ts` | GDPR 対応（ショップデータ削除要求） |

### Webhook 受信エンドポイント

```1:48:web/app/api/webhooks/route.ts
import shopify from "@/lib/shopify/initialize-context";
import { addHandlers } from "@/lib/shopify/register-webhooks";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const topic = (await headers()).get("x-shopify-topic") as string;

    if (!topic) {
      console.error("Webhook topic is missing");
      return new Response(null, { status: 400 });
    }

    // Seems like there is some weird behaviour where the shopify api doesn't have the handlers registered - possibly due to some serverless behaviour
    const handlers = shopify.webhooks.getHandlers(topic);
    if (handlers.length === 0) {
      console.log(`No handlers found for topic: ${topic}`);
      addHandlers();
    }

    const rawBody = await req.text();

    if (!rawBody) {
      console.error("Webhook body is empty");
      return new Response(null, { status: 400 });
    }

    await shopify.webhooks.process({
      rawBody,
      rawRequest: req,
    });

    console.log(`Webhook processed successfully for topic: ${topic}`);
    return new Response(null, { status: 200 });
  } catch (error) {
    // Webhook のエラーをログに記録
    console.error("Webhook processing error:", error);

    // Shopify は 5xx エラーの場合に再試行するため、一時的なエラーは 500 を返す
    // 永続的なエラー（バリデーションエラーなど）は 400 を返す
    const statusCode =
      error instanceof Error && error.message.includes("validation")
        ? 400
        : 500;

    return new Response(null, { status: statusCode });
  }
}
```

**重要なポイント:**
- サーバーレス環境では、ハンドラが登録されていない場合があるため、リクエストごとに `addHandlers()` を呼び出す必要がある
- Shopify は 5xx エラーの場合に Webhook を再試行するため、一時的なエラーは 500、永続的なエラーは 400 を返す

### Webhook ハンドラ登録

```8:26:web/lib/shopify/register-webhooks.ts
export function addHandlers() {
  if (!webhooksInitialized) {
    setupGDPRWebHooks("/api/webhooks");
    shopify.webhooks.addHandlers({
      ["APP_UNINSTALLED"]: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (_topic, shop, _body) => {
          console.log("Uninstalled app from shop: " + shop);
          await AppInstallations.delete(shop);
        },
      },
    });
    console.log("Added handlers");
    webhooksInitialized = true;
  } else {
    console.log("Handlers already added");
  }
}
```

---

## データベース設計

### Prisma スキーマ

このテンプレートは、セッション情報とアプリインストール情報を保存するために Prisma を使用しています。

```14:53:web/prisma/schema.prisma
model Session {
  id               String            @id @default(uuid())
  accessToken      String?
  expires          DateTime?
  isOnline         Boolean
  scope            String?
  shop             String
  state            String
  apiKey           String
  onlineAccessInfo OnlineAccessInfo?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model OnlineAccessInfo {
  id                  String          @id @default(uuid())
  session             Session?        @relation(fields: [sessionId], references: [id])
  sessionId           String?         @unique
  expiresIn           Int
  associatedUserScope String
  associatedUser      AssociatedUser?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}

model AssociatedUser {
  id                 String            @id @default(uuid())
  onlineAccessInfo   OnlineAccessInfo? @relation(fields: [onlineAccessInfoId], references: [id])
  onlineAccessInfoId String?           @unique
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  userId             BigInt
  firstName          String
  lastName           String
  email              String
  accountOwner       Boolean
  locale             String
  collaborator       Boolean
  emailVerified      Boolean
}
```

### モデルの説明

| モデル | 説明 |
|-------|------|
| **Session** | Shopify セッション情報（アクセストークン、ショップ情報、スコープ）を保存。オフライン・オンライン両方のセッションに対応 |
| **OnlineAccessInfo** | オンラインアクセストークンに関連する情報（有効期限、ユーザースコープ）を保存 |
| **AssociatedUser** | オンラインアクセストークンに関連するユーザー情報（名前、メール、権限）を保存 |

### セッション保存処理

```12:76:web/lib/db/session-storage.ts
export async function storeSession(session: ShopifySession) {
  await prisma.session.upsert({
    where: { id: session.id },
    update: {
      shop: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expires: session.expires,
      isOnline: session.isOnline,
      state: session.state,
      apiKey,
    },
    create: {
      id: session.id,
      shop: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expires: session.expires,
      isOnline: session.isOnline,
      state: session.state,
      apiKey,
    },
  });

  if (session.onlineAccessInfo) {
    const onlineAccessInfo = await prisma.onlineAccessInfo.upsert({
      where: { sessionId: session.id },
      update: {
        expiresIn: session.onlineAccessInfo.expires_in,
        associatedUserScope: session.onlineAccessInfo.associated_user_scope,
      },
      create: {
        sessionId: session.id,
        expiresIn: session.onlineAccessInfo.expires_in,
        associatedUserScope: session.onlineAccessInfo.associated_user_scope,
      },
    });

    const { associated_user } = session.onlineAccessInfo;
    const associatedUser = await prisma.associatedUser.upsert({
      where: { onlineAccessInfoId: onlineAccessInfo.id },
      update: {
        firstName: associated_user.first_name,
        lastName: associated_user.last_name,
        email: associated_user.email,
        emailVerified: associated_user.email_verified,
        accountOwner: associated_user.account_owner,
        locale: associated_user.locale,
        collaborator: associated_user.collaborator,
        userId: associated_user.id,
      },
      create: {
        onlineAccessInfoId: onlineAccessInfo.id,
        firstName: associated_user.first_name,
        lastName: associated_user.last_name,
        email: associated_user.email,
        emailVerified: associated_user.email_verified,
        accountOwner: associated_user.account_owner,
        locale: associated_user.locale,
        collaborator: associated_user.collaborator,
        userId: associated_user.id,
      },
    });
  }
}
```

- `upsert` を使用して、セッションが存在する場合は更新、存在しない場合は作成
- オンラインアクセストークンの場合、`OnlineAccessInfo` と `AssociatedUser` も保存

---

## セキュリティ・CSP

### Content Security Policy (CSP)

埋め込みアプリは、Shopify Admin の iframe 内で動作するため、CSP ヘッダーを適切に設定する必要があります。

```18:35:web/middleware.ts
export function middleware(request: NextRequest) {
  const {
    nextUrl: { search },
  } = request;

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const shop = params.shop || "*.myshopify.com";

  const res = NextResponse.next();
  res.headers.set(
    "Content-Security-Policy",
    `frame-ancestors https://${shop} https://admin.shopify.com;`,
  );

  // You can also set request headers in NextResponse.rewrite
  return res;
}
```

**CSP の役割:**
- `frame-ancestors` ディレクティブで、アプリを埋め込むことができる親フレームを制限
- `https://${shop}` と `https://admin.shopify.com` のみが iframe として読み込める

**除外されるパス:**
- `/api/auth`, `/api/auth/callback`, `/api/webhooks` などは CSP が適用されない（`matcher` で除外）

---

## ローカル開発フロー

### 必須コマンド

| コマンド | 説明 | 実行場所 |
|---------|------|---------|
| `pnpm install` | 依存関係をインストール | ルート |
| `pnpm run dev` | 開発サーバー起動（Shopify CLI 経由） | ルート |
| `docker compose up -d` | PostgreSQL をローカルで起動 | ルート |
| `cd web && pnpm run migrate` | データベースマイグレーション実行 | web/ |
| `cd web && pnpm run graphql-codegen` | GraphQL 型生成 | web/ |

### 環境変数

**ルート `.env`（Docker Compose / Prisma / Next.js 用）:**
```bash
POSTGRES_PASSWORD=your_password

DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
DIRECT_DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
```

**Shopify CLI が自動注入する環境変数:**
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES`
- `HOST`

これらの変数は `pnpm run dev` 実行時に Shopify CLI が自動的に注入します。

### 開発サーバー起動の流れ

1. **データベース起動:**
   ```bash
   docker compose up -d
   ```

2. **マイグレーション実行（初回のみ）:**
   ```bash
   cd web
   pnpm run migrate
   ```

3. **開発サーバー起動:**
   ```bash
   # ルートに戻る
   cd ..
   pnpm run dev
   ```

   - Shopify CLI がトンネル（ngrok など）を開き、`HOST` を設定
   - Next.js 開発サーバーが起動（通常は `http://localhost:3000`）
   - Shopify Partners ダッシュボードでアプリ URL が自動更新される

4. **GraphQL 型生成（必要に応じて）:**
   ```bash
   cd web
   pnpm run graphql-codegen
   ```

---

## よくある落とし穴

### 1. `web/.env` の必要性（旧）

**問題:** Prisma のコマンド（`migrate` など）は Shopify CLI の環境変数注入とは独立に実行されるため、`DATABASE_URL` が未設定になりやすい。

**解決策（推奨）:** ルート `.env` に `DATABASE_URL` と `DIRECT_DATABASE_URL` を設定する（`web/` からも参照する）。

**補足:** 互換のため `web/.env` を置く運用も可能（フォールバック）。

### 2. Webhook ハンドラが登録されていない

**問題:** サーバーレス環境（Vercel など）では、Webhook ハンドラが登録されていない場合がある。

**解決策:** `web/app/api/webhooks/route.ts` で、ハンドラが存在しない場合は `addHandlers()` を呼び出す。

### 3. CSP エラー

**問題:** 埋め込みアプリが iframe で読み込めない、または CSP エラーが発生する。

**解決策:** `middleware.ts` で `frame-ancestors` ヘッダーが正しく設定されているか確認。開発環境では `shop` パラメータが URL に含まれているか確認。

### 4. セッションが保存されない

**問題:** `storeToken` が呼ばれているのに、データベースにセッションが保存されない。

**解決策:**
- `handleSessionToken` の第3引数 `store` が `true` になっているか確認
- Prisma Client が正しく生成されているか確認（`cd web && pnpm run postinstall`）
- データベース接続文字列（`DATABASE_URL`）が正しいか確認

### 5. GraphQL 型が生成されない

**問題:** GraphQL クエリを追加したが、TypeScript の型が生成されない。

**解決策:**
- `cd web && pnpm run graphql-codegen` を実行
- `.graphqlrc.yml` の `documents` パスが正しいか確認
- GraphQL スキーマの URL が正しいか確認（`codegen.ts` を確認）

### 6. Token Exchange エラー

**問題:** `tokenExchange` でエラーが発生する。

**解決策:**
- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `HOST` が正しく設定されているか確認
- `shopify.app.toml` の `direct_api_mode = "offline"` が設定されているか確認
- セッショントークンが有効期限内か確認（App Bridge が自動的に管理）

### 7. マイグレーションエラー

**問題:** `pnpm run migrate` でエラーが発生する。

**解決策:**
- PostgreSQL が起動しているか確認（`docker ps`）
- `DATABASE_URL` が正しく設定されているか確認
- 既存のマイグレーションと競合していないか確認（`web/prisma/migrations/` を確認）

---

## まとめ

このテンプレートは、**Next.js App Router** と **App Bridge v4** を使用した Shopify 埋め込みアプリの開発基盤を提供します。

**主要な特徴:**
- Token Exchange による簡潔な認証フロー
- Prisma による型安全なデータベース接続
- Tanstack Query による効率的なデータフェッチング
- Webhook の自動登録・受信処理
- CSP によるセキュリティ確保

**開発時の注意点:**
- ルート `.env` にデータベース接続文字列（`DATABASE_URL`）を設定する
- GraphQL クエリを追加したら型生成を実行する
- Webhook ハンドラはサーバーレス環境で再登録が必要な場合がある

この仕様書を参考に、テンプレートの構造を理解し、効率的に開発を進めてください。