# Shopify アプリテンプレート - Next.js App Router

このテンプレートは、Next.js と TypeScript を使用して [Shopify アプリ](https://shopify.dev/apps/getting-started) を構築するためのものです。App Router とサーバーコンポーネントを使用して Next.js 上で Shopify アプリを構築するための基本的な機能が含まれています。

## 機能

- **Next.js**: 最新の App Router とサーバーコンポーネントを使用
- **Prisma（オプション）**: データベース接続とマイグレーションの管理
- **Tanstack Query**: Shopify GraphQL API との連携
- **App Bridge v4**: フロントエンドでの API リクエストの認証
- **Shopify API ライブラリ**: サーバーレスバックエンドでの OAuth 管理
- **Polaris Web Components**: Shopify マーチャント向けの高品質で一貫性のある体験を構築（Shopify CDN から読み込み）
- **Tailwind CSS**: 高速で柔軟なスタイリングとデザイン
- **Docker（オプション）**: ローカル開発用の PostgreSQL データベースのセットアップ
- **GraphQL Codegen**: GraphQL クエリとミューテーションの型生成

> 📚 **詳細なドキュメント:**  
> - [テンプレート仕様書](docs/TEMPLATE_SPEC_JA.md) - 認証フロー、データベース設計、Webhook 処理などの技術仕様
> - [セットアップガイド](docs/SETUP_JA.md) - ローカル開発環境のセットアップ手順
> - [テンプレートの特徴](docs/TEMPLATE_FEATURES_JA.md) - このテンプレートの特徴と公式テンプレートとの違い

## テンプレートのインストール

このテンプレートは、お好みのパッケージマネージャーを使用してインストールできます：

pnpm を使用（推奨）：

```shell
pnpx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
```

これにより、テンプレートがクローンされ、必要な依存関係がインストールされます。

## Next.js と Shopify 埋め込みアプリ

このテンプレートの目標は、Next.js App Router プラットフォームを使用する Shopify 埋め込みアプリを迅速かつ簡単に立ち上げる方法を提供することです。

テンプレートは、App Bridge v4 のいくつかの機能を使用して開発を容易にします。認証やセッション管理などが含まれます。

### プロバイダー

`layout.tsx` では、アプリの実行に必要なプロバイダーを設定しています。

- **ApolloProvider（オプション）**: GraphQL クエリとミューテーションを実行するための Apollo コンテキストを設定します。これは `/api/graphql` Next.js ルートを通じて実行され、Shopify API ライブラリによって処理されます。
- **SessionProvider（オプション）**: ユーザーが常にアクティブなセッションを持ち、アプリが正しくインストールされていることを保証します。必要に応じてユーザーを認証ページにリダイレクトします。

### App Bridge

直接 API モードと新しいインストールフローを使用しているため、アプリのインストールは自動的に処理されます。

```toml
[access.admin]
direct_api_mode = "offline"
embedded_app_direct_api_access = true

[access_scopes]
# 詳細は https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes を参照
scopes = ""
use_legacy_install_flow = false
```

### トークン交換

アプリテンプレートはデフォルトでトークン交換を使用します。ユーザーは初期ページ読み込み時に ID トークンを取得し、それをサーバーに送信して保存します。これはサーバーアクションを使用して行われます。

また、すべてのサーバーアクションにはセッショントークンが一緒に送信される必要があり、サーバーは必要に応じてトークンを検証および交換できます。

### 環境変数

アプリを実行するために設定する必要がある環境変数がいくつかあります。ルートディレクトリ（または Next.js アプリのルート）に `.env` という名前のファイルを作成し、以下の行を追加してください：

```bash
DATABASE_URL= # データベース接続文字列 - Prisma への接続用
POSTGRES_PASSWORD= # オプションのデータベースパスワード - Docker 経由でローカルに PostgreSQL DB を実行する場合
```

最初の2つの変数は、Shopify CLI によって自動的に設定されます。

## 技術スタック

このテンプレートは、多数のサードパーティのオープンソースツールを組み合わせています：

- [Next.js](https://nextjs.org/) が [React](https://reactjs.org/) フロントエンドを構築します。

以下の Shopify ツールが、これらのサードパーティツールを補完してアプリ開発を容易にします：

- [Shopify API ライブラリ](https://github.com/Shopify/shopify-api-js?tab=readme-ov-file) がサーバーレスバックエンドで OAuth を管理します。これにより、ユーザーがアプリをインストールし、スコープ権限を付与できます。
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react) がフロントエンドの API リクエストに認証を追加し、アプリの iFrame の外側にコンポーネントをレンダリングします。
- [Apollo](https://www.apollographql.com/) は Shopify GraphQL API との連携に使用されます（オプション）。
- [Prisma](https://www.prisma.io/) はデータベース接続とマイグレーションの管理に使用されます。これはオプションですが、優れた ORM を提供します。テンプレートはデータベースに依存しないため、任意のデータベースを使用できます。

## はじめに

### ローカル開発

[Shopify CLI](https://shopify.dev/apps/tools/cli) は、Partners ダッシュボードのアプリに接続します。環境変数を提供し、コマンドを並列実行し、アプリケーション URL を更新して開発を容易にします。

お好みのパッケージマネージャーを使用してローカルで開発できます。

pnpm を使用：

```shell
pnpm run dev
```

#### ローカル開発用の Docker

Docker を使用して起動することもできます。これにより、PostgreSQL データベースがセットアップおよび初期化されます。

```shell
docker-compose up
pnpm run migrate
```

#### GraphQL Codegen

以下のコマンドを実行すると、GraphQL クエリとミューテーションの型が生成されます。

```shell
pnpm run graphql-codegen
```

これにより、Apollo クライアントを使用する際の型がセットアップされ、IDE でインテリセンスが利用できるようになります。

## デプロイ

このアプリは、お好みのホスティングサービスにデプロイできます。Vercel へのデプロイの基本的なセットアップは以下の通りです：

- Shopify Partners ダッシュボードで Shopify アプリを作成
- Vercel でプロジェクトを作成し、Shopify アプリから環境変数を追加
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SCOPES`
  - `HOST`
  - データベース接続文字列
- Shopify アプリを、Vercel デプロイと同じ `/api/auth/callback` と `/api/auth` ルートを持つように設定（ホスト名付き）

Vercel は、デフォルトの Next.js ビルド設定を使用してビルドするようにセットアップする必要があります。

管理された Shopify デプロイも使用する必要があります。これにより、アプリのスコープ変更が処理されます。

```shell
pnpm run deploy
```

### アプリケーションストレージ

このテンプレートは、セッションの保存と管理に Prisma を使用します。Prisma のセットアップ方法の詳細については、[Prisma ドキュメント](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-typescript-postgres)を参照してください。

## 開発者リソース

- [Shopify アプリの概要](https://shopify.dev/apps/getting-started)
- [アプリ認証](https://shopify.dev/apps/auth)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API ライブラリドキュメント](https://github.com/Shopify/shopify-api-node/tree/main/docs)

