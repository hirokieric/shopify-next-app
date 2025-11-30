# セットアップガイド

このドキュメントでは、Shopify アプリをローカル環境で立ち上げる手順を詳しく説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [プロジェクトの準備](#プロジェクトの準備)
3. [依存関係のインストール](#依存関係のインストール)
4. [Shopify CLI のセットアップ](#shopify-cli-のセットアップ)
5. [データベースのセットアップ](#データベースのセットアップ)
6. [環境変数の設定](#環境変数の設定)
7. [データベースマイグレーション](#データベースマイグレーション)
8. [GraphQL 型生成（オプション）](#graphql-型生成オプション)
9. [開発サーバーの起動](#開発サーバーの起動)
10. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

以下のツールがインストールされている必要があります：

### 必須ツール

- **Node.js** (v18以上推奨)
  - インストール確認: `node --version`
  - インストール方法: [Node.js公式サイト](https://nodejs.org/)からダウンロード

- **pnpm** (パッケージマネージャー)
  - インストール確認: `pnpm --version`
  - インストール方法: `npm install -g pnpm`

- **Shopify CLI** (v3.0以上)
  - インストール確認: `shopify version`
  - インストール方法: `npm install -g @shopify/cli @shopify/theme`

- **Docker Desktop** (データベースをローカルで起動する場合)
  - インストール確認: `docker --version`
  - インストール方法: [Docker公式サイト](https://www.docker.com/products/docker-desktop/)からダウンロード

### Shopify アカウント

- **Shopify Partners アカウント**
  - アカウント作成: [Shopify Partners](https://partners.shopify.com/)で無料アカウントを作成

- **開発用ストア** (オプション)
  - Partners ダッシュボードから開発用ストアを作成できます

---

## プロジェクトの準備

### 1. プロジェクトをクローンまたはダウンロード

既にプロジェクトがある場合は、このステップをスキップしてください。

```bash
# Git リポジトリからクローンする場合
git clone <リポジトリのURL>
cd shopify-next-app
```

### 2. プロジェクトディレクトリに移動

```bash
cd shopify-next-app
```

---

## 依存関係のインストール

プロジェクトのルートディレクトリで、すべての依存関係をインストールします。

```bash
# ルートディレクトリで実行
pnpm install
```

このコマンドは、ルートと `web/` ディレクトリの両方の依存関係をインストールします。

**インストールが完了したら:**
- `node_modules/` フォルダが作成されます
- Prisma Client が自動的に生成されます（`postinstall` スクリプトにより）

---

## Shopify CLI のセットアップ

### 1. Shopify CLI にログイン

```bash
shopify auth login
```

ブラウザが開き、Shopify Partners アカウントでログインするよう求められます。

### 2. Shopify アプリの作成（初回のみ）

既に Shopify Partners ダッシュボードでアプリを作成している場合は、このステップをスキップしてください。

```bash
shopify app generate
```

または、Shopify Partners ダッシュボードで手動でアプリを作成することもできます。

---

## データベースのセットアップ

データベースのセットアップには2つの方法があります：

### 方法1: Docker を使用（推奨・ローカル開発）

Docker を使用すると、PostgreSQL データベースを簡単にローカルで起動できます。

#### ステップ1: 環境変数ファイルの作成

プロジェクトのルートディレクトリに `.env` ファイルを作成します。

```bash
# .env.example をコピー
cp .env.example .env
```

#### ステップ2: Docker Compose でデータベースを起動

```bash
# データベースを起動（バックグラウンドで実行）
docker-compose up -d
```

**確認方法:**
```bash
# データベースが起動しているか確認
docker ps
```

`postgres` コンテナが表示されていれば成功です。

#### ステップ3: データベース接続文字列の設定

`.env` ファイルを開き、以下のように設定します：

```bash
# Docker で起動した PostgreSQL の場合
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
DIRECT_DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
POSTGRES_PASSWORD=your_password
```

**注意:** `your_password` は、`.env` ファイルの `POSTGRES_PASSWORD` と同じ値にしてください。

### 方法2: 既存のデータベースを使用

既に PostgreSQL データベースがある場合：

```bash
# .env ファイルに接続文字列を設定
DATABASE_URL="postgresql://user:password@host:5432/database_name?schema=public"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/database_name?schema=public"
```

---

## 環境変数の設定

### 1. 環境変数ファイルの確認

`.env` ファイルが存在することを確認します。

```bash
# ファイルが存在するか確認
ls -la .env
```

存在しない場合は、`.env.example` をコピーします：

```bash
cp .env.example .env
```

### 2. Shopify CLI による自動設定

開発サーバーを起動すると、Shopify CLI が以下の環境変数を自動的に設定します：

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES`
- `HOST`

**手動で設定する場合:**

`.env` ファイルを開き、Shopify Partners ダッシュボードから取得した値を設定します：

```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products
HOST=https://your-app-url.ngrok.io
```

---

## データベースマイグレーション

データベースのテーブルを作成するために、Prisma マイグレーションを実行します。

```bash
# web ディレクトリに移動
cd web

# マイグレーションを実行
pnpm run migrate
```

**初回実行時:**
- マイグレーションファイルが作成されます
- データベースにテーブルが作成されます

**確認方法:**
```bash
# Prisma Studio でデータベースを確認（オプション）
npx prisma studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容を確認できます。

---

## GraphQL 型生成（オプション）

GraphQL クエリとミューテーションの型を生成します。これは TypeScript の型安全性を向上させます。

```bash
# web ディレクトリで実行
cd web
pnpm run graphql-codegen
```

**生成されるファイル:**
- `web/lib/gql/` - GraphQL クエリの型定義
- `web/types/admin.generated.d.ts` - Admin API の型定義

**注意:** このコマンドは、GraphQL クエリを使用する前に実行することを推奨します。

---

## 開発サーバーの起動

すべてのセットアップが完了したら、開発サーバーを起動します。

### 1. プロジェクトのルートディレクトリに戻る

```bash
# プロジェクトのルートディレクトリに移動
cd ..
```

### 2. 開発サーバーを起動

```bash
pnpm run dev
```

**このコマンドは以下を実行します:**
- Shopify CLI が環境変数を自動設定
- Next.js 開発サーバーが起動
- トンネル（ngrok）が自動的に設定され、Shopify アプリに接続

**初回起動時:**
- ブラウザが自動的に開きます
- Shopify アプリのインストール画面が表示されます
- 開発用ストアを選択してインストールを完了してください

**正常に起動すると:**
- ターミナルに開発サーバーの URL が表示されます
- 例: `https://xxxx-xxxx-xxxx.ngrok.io`

### 3. アプリの確認

ブラウザでアプリが開き、Shopify 管理画面に埋め込まれたアプリが表示されます。

---

## トラブルシューティング

### 問題1: `pnpm: command not found`

**解決方法:**
```bash
npm install -g pnpm
```

### 問題2: `shopify: command not found`

**解決方法:**
```bash
npm install -g @shopify/cli @shopify/theme
```

### 問題3: データベースに接続できない

**確認事項:**
1. Docker コンテナが起動しているか確認
   ```bash
   docker ps
   ```
2. `.env` ファイルの `DATABASE_URL` が正しいか確認
3. データベースのパスワードが正しいか確認

**解決方法:**
```bash
# Docker コンテナを再起動
docker-compose down
docker-compose up -d
```

### 問題4: マイグレーションエラー

**解決方法:**
```bash
# データベースをリセット（開発環境のみ）
cd web
npx prisma migrate reset
pnpm run migrate
```

**注意:** このコマンドはデータベースのすべてのデータを削除します。

### 問題5: Shopify CLI の認証エラー

**解決方法:**
```bash
# 再度ログイン
shopify auth logout
shopify auth login
```

### 問題6: ポートが既に使用されている

**解決方法:**
- 他のアプリケーションがポートを使用していないか確認
- Docker コンテナのポート設定を確認

### 問題7: Prisma Client が生成されない

**解決方法:**
```bash
cd web
npx prisma generate
```

### 問題8: 環境変数が読み込まれない

**確認事項:**
1. `.env` ファイルがプロジェクトのルートディレクトリにあるか確認
2. 環境変数の名前が正しいか確認（大文字・小文字に注意）
3. 値に余分なスペースや引用符がないか確認

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照してください：

- [README_JA.md](./README_JA.md) - プロジェクトの概要と機能
- [README.md](./README.md) - 英語版のドキュメント

## よくある質問

### Q: 開発サーバーを停止するには？

**A:** ターミナルで `Ctrl + C` を押してください。

### Q: データベースをリセットしたい

**A:**
```bash
cd web
npx prisma migrate reset
pnpm run migrate
```

### Q: 複数の開発環境で作業するには？

**A:** 各環境で異なる `.env` ファイルを使用するか、環境変数を直接設定してください。

### Q: プロダクション環境へのデプロイ方法は？

**A:** [README_JA.md](./README_JA.md) の「デプロイ」セクションを参照してください。

---

## サポート

問題が解決しない場合は、以下を確認してください：

1. すべての前提条件が満たされているか
2. 環境変数が正しく設定されているか
3. データベースが正常に起動しているか
4. ログファイルでエラーメッセージを確認

---

**セットアップ完了！** 🎉

開発サーバーが起動したら、Shopify アプリの開発を始められます。

