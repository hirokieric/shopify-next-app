# Shopify Next.js アプリテンプレート

このテンプレートは、Next.jsとTypeScriptを使用して[Shopifyアプリ](https://shopify.dev/docs/apps/getting-started)を構築するためのものです。Next.jsのアプリルーターとサーバーコンポーネントを使用してShopifyアプリを構築するための基本機能が含まれています。

## 特徴

- **Next.js**: 最新のアプリルーターとサーバーコンポーネントを使用
- **Prisma (オプション)**: データベース接続とマイグレーションの管理
- **Tanstack Query**: Shopify GraphQL APIとの連携
- **App Bridge v4**: フロントエンドでのAPI認証
- **Shopify API ライブラリ**: サーバーレスバックエンドでのOAuth管理
- **Polaris React**: Shopify加盟店向けの高品質で一貫した体験を構築
- **Tailwind CSS**: 迅速で柔軟なスタイリングとデザイン
- **Docker (オプション)**: ローカル開発用のPostgresデータベース設定
- **Graphql-Codegen**: GraphQLクエリとミューテーションの型生成

### テンプレートのインストール

このテンプレートは、お好みのパッケージマネージャーを使用してインストールできます：

pnpm（推奨）を使用する場合:

```shell
pnpx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
```

これによりテンプレートがクローンされ、必要な依存関係がインストールされます。

## Next.jsとShopify埋め込みアプリ

このテンプレートの目的は、Next.jsのアプリルータープラットフォームを使用するShopify埋め込みアプリを素早く簡単に立ち上げることです。

テンプレートはApp Bridge v4の機能を活用して、認証やセッション管理などを容易にします。

### プロバイダー

- `layout.tsx`では、アプリの実行に必要ないくつかのプロバイダーを設定しています。
  - **ApolloProvider**: (オプション) GraphQLクエリとミューテーションを実行するためのApolloコンテキストを設定します。これは`/api/graphql` Next.jsルートを通じて実行され、Shopify APIライブラリによって処理されます。
  - **SessionProvider**: (オプション) ユーザーが常にアクティブなセッションを持ち、アプリが正しくインストールされていることを確認します。基本的に、認証が必要な場合にユーザーをリダイレクトします。

### App Bridge

ダイレクトAPIモードと新しいインストールフローを使用しているため、アプリのインストールは自動的に処理されます。

```toml
[access.admin]
direct_api_mode = "offline"
embedded_app_direct_api_access = true

[access_scopes]
# Learn more at https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes
scopes = ""
use_legacy_install_flow = false
```

### トークン交換

アプリテンプレートはデフォルトでトークン交換を使用します。ユーザーは初期ページロード時にIDトークンを取得し、それをサーバーに送信して保存します。これはサーバーアクションを使用して行われます。

また、すべてのサーバーアクションにはセッショントークンを一緒に送信する必要があります。サーバーは必要に応じてトークンを検証し、交換することができます。

### 環境変数

アプリを実行するためにはいくつかの環境変数を設定する必要があります。ルートディレクトリ（またはNext.jsアプリのルート）に`.env`というファイルを作成し、以下の行を追加してください：

```bash
DATABASE_URL= # データベース接続文字列 - Prismaへの接続用
POSTGRES_PASSWORD= # オプションのデータベースパスワード - Dockerを通じてローカルでPostgresDBを実行する場合
```

最初の2つの変数はShopify CLIによって自動的に入力されます。

## 技術スタック

このテンプレートは、いくつかのサードパーティのオープンソースツールを組み合わせています：

- [Next.js](https://nextjs.org/)は[React](https://reactjs.org/)フロントエンドを構築します。

以下のShopifyツールは、これらのサードパーティツールを補完し、アプリ開発を容易にします：

- [Shopify APIライブラリ](https://github.com/Shopify/shopify-api-js?tab=readme-ov-file)はサーバーレスバックエンドでOAuthを管理します。これにより、ユーザーはアプリをインストールしてスコープ権限を付与できます。
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react)はフロントエンドのAPI要求に認証を追加し、アプリのiFrameの外部にコンポーネントをレンダリングします。
- [Apollo](https://www.apollographql.com/)はShopify GraphQL APIとの連携に使用します（オプション）。
- [Prisma](https://www.prisma.io/)はデータベース接続とマイグレーションの管理に使用します。これはオプションですが、便利なORMを提供します。テンプレートはデータベースに依存しないため、好きなデータベースを使用できます。

## 始め方

### ローカル開発

[Shopify CLI](https://shopify.dev/apps/tools/cli)は、Partnersダッシュボードのアプリに接続します。環境変数を提供し、コマンドを並行して実行し、アプリケーションのURLを更新して開発を容易にします。

お好みのパッケージマネージャーを使ってローカルで開発できます。

pnpmを使用する場合：

```shell
pnpm run dev
```

#### ローカル開発用Docker

Dockerを使って環境を構築することもできます。これによりPostgresデータベースがセットアップされ初期化されます。

**注意**: Docker Desktop for Macが必要です。Dockerのバージョンによってコマンドが異なります。

新しいDocker（Docker Desktop 3.x以上）:

```shell
docker compose up -d
pnpm run migrate
```

古いDocker:

```shell
docker-compose up -d
pnpm run migrate
```

「command not found: docker-compose」というエラーが表示される場合は、以下のいずれかを試してください：

1. Docker Desktopがインストールされていることを確認する
2. 新しいバージョンでは`docker compose`（ハイフンなし）を使用する
3. `brew install docker-compose`でDocker Composeを別途インストールする

#### Graphql-Codegen

次のコマンドを実行すると、GraphQLクエリとミューテーションの型が生成されます。

```shell
pnpm run graphql-codegen
```

これにより、Apollo clientを使用する際の型が設定され、IDEでのインテリセンスが提供されます。

## デプロイメント

このアプリは任意のホスティングサービスにデプロイできます。Vercelへのデプロイの基本的なセットアップは次のとおりです：

- Shopify Partnersダッシュボードで新しいShopifyアプリを作成
- Vercelでプロジェクトを作成し、ShopifyアプリからEnvironment Variablesを追加
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SCOPES`
  - `HOST`
  - 必要なデータベース接続文字列
- ShopifyアプリのコールバックURLを、Vercelデプロイメントと同じ `/api/auth/callback` および `/api/auth` ルートに設定（ホスト名を含む）

Vercelは、デフォルトのNext.jsビルド設定を使用してビルドするように設定する必要があります。

また、管理されたShopifyデプロイメントを使用する必要があります。これによりアプリのスコープの変更が処理されます。

```shell
pnpm run deploy
```

### アプリケーションストレージ

このテンプレートはPrismaを使用してセッションを保存および管理します。Prismaの設定方法の詳細については、[Prismaドキュメント](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-typescript-postgres)を参照してください。

## Macでの開発環境構築手順

Macでこのテンプレートを使用するための手順は以下の通りです：

1. **前提条件の確認**
   - Node.js 18以上のインストール: `brew install node`
   - Docker Desktop for Macのインストール（Postgresデータベースを使用する場合）
   - pnpm（推奨）のインストール: `npm install -g pnpm`

2. **テンプレートのインストール**

   ```bash
   pnpx @shopify/create-app@latest --template https://github.com/ozzyonfire/shopify-next-app.git
   ```

3. **環境変数の設定（重要）**
   - プロジェクトのルートディレクトリに`.env`ファイルを作成
   - さらに`web`ディレクトリにも`.env`ファイルを作成（Prismaマイグレーションに必須）
   - 必要な環境変数を設定：

   ルートディレクトリの`.env`:

   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=write_products,read_orders,write_customers
   HOST=localhost:3000
   POSTGRES_PASSWORD=postgres
   ```

   `web`ディレクトリの`.env`:

   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=write_products,read_orders,write_customers
   HOST=localhost:3000
   DATABASE_URL="file:./dev.db"  # SQLite用
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app"  # PostgreSQL用
   SHOPIFY_APP_URL=https://localhost:3000
   ```

4. **データベースの起動（Dockerを使用）**

   ```bash
   pnpm run docker-dev
   ```

5. **データベースマイグレーションの実行**

   ```bash
   # webディレクトリに.envファイルがあることを確認（重要）
   # web/prisma/schema.prismaでデータベース設定を確認してから実行
   cd web
   npx prisma migrate dev --name init
   ```

   注意: `Environment variable not found: DATABASE_URL`というエラーが出る場合は、
   webディレクトリに.envファイルがあり、DATABASE_URLが正しく設定されていることを確認してください。

6. **開発サーバーの起動**

   ```bash
   cd .. && pnpm run dev
   ```

7. **ngrokの設定（外部からのアクセスが必要な場合）**
   - ngrokをインストール: `brew install ngrok`
   - 認証トークンを設定: `ngrok authtoken your_auth_token`
   - トンネルを開始: `ngrok http 3000`
   - 環境変数のHOSTとSHOPIFY_APP_URLをngrokのURLに更新

## 開発者リソース

- [Shopifyアプリ入門](https://shopify.dev/apps/getting-started)
- [アプリ認証](https://shopify.dev/apps/auth)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API ライブラリドキュメント](https://github.com/Shopify/shopify-api-node/tree/main/docs)
