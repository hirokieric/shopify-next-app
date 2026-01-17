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
9. [Cloudflare Tunnel で固定サブドメインを使う（オプション）](#cloudflare-tunnel-で固定サブドメインを使うオプション)
10. [開発サーバーの起動](#開発サーバーの起動)
11. [トラブルシューティング](#トラブルシューティング)

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
  - Compose の確認: `docker compose version`
  - 注意: 最近の Docker では `docker-compose`（ハイフンあり）ではなく、`docker compose`（スペースあり）が標準です。
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
cd <リポジトリ名>
```

### 2. プロジェクトディレクトリに移動

```bash
cd <リポジトリ名>
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
shopify app init
```

**補足:** `shopify app generate` はアプリ本体の作成ではなく、主に **拡張機能（extension）の生成** に使います。拡張機能を作る場合は以下のように実行します：

```bash
shopify app generate extension
```

または、Shopify Partners ダッシュボードで手動でアプリを作成することもできます。

---

## データベースのセットアップ

データベースのセットアップには2つの方法があります：

### 方法1: Docker を使用（推奨・ローカル開発）

Docker を使用すると、PostgreSQL データベースを簡単にローカルで起動できます。

#### ステップ1: 環境変数ファイルの作成

このプロジェクトでは、用途が異なるため **ルートと `web/` の両方に `.env` が必要**です：

- **ルートの `.env`**: `docker compose` が参照（例: `POSTGRES_PASSWORD`）
- **`web/.env`**: Prisma / Next.js（`cd web` で実行するコマンド）が参照（例: `DATABASE_URL`）

```bash
# ルート（Docker Compose 用）
cat > .env <<'EOF'
# docker-compose.yml が参照します
POSTGRES_PASSWORD=your_password
EOF

# web（Prisma / Next.js 用）
cat > web/.env <<'EOF'
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
DIRECT_DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
EOF
```

**補足:** 1つの `.env` を使い回したい場合は、macOS/Linux ではシンボリックリンクも使えます（必要な変数がすべて入っている前提）:

```bash
ln -s ../.env web/.env
```

#### ステップ2: Docker Compose でデータベースを起動

```bash
# データベースを起動（バックグラウンドで実行）
docker compose up -d
```

**確認方法:**
```bash
# データベースが起動しているか確認
docker ps
```

`postgres` コンテナが表示されていれば成功です。

#### ステップ3: データベース接続文字列の設定

`.env`（ルート）と `web/.env` の両方を開き、以下のように設定します：

```bash
# ルート .env（docker compose が参照）
POSTGRES_PASSWORD=your_password

# web/.env（Prisma / Next.js が参照）
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
DIRECT_DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_app?schema=public"
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

`.env`（ルート）と `web/.env` が存在することを確認します。

```bash
# ファイルが存在するか確認
ls -la .env web/.env
```

存在しない場合は、上記の手順に従って作成してください。

### 2. Shopify CLI による自動設定

開発サーバー（`pnpm run dev`）を起動すると、Shopify CLI が以下の環境変数を **実行プロセスに注入**します：

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES`
- `HOST`

**重要:** Prisma のコマンド（例: `cd web && pnpm run migrate`）は Shopify CLI の注入とは独立に実行されるため、DB 接続（`DATABASE_URL` など）は基本的に **`web/.env` に入れておく**のが安全です。

**手動で設定する場合:**

必要に応じて（Shopify CLI を使わず `web/` 単体で起動する場合など）、`web/.env` に Shopify Partners ダッシュボードから取得した値を設定します：

```bash
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products
HOST=https://your-app-url.ngrok.io
```

---

## shopify.app.toml の生成

`shopify.app.toml` ファイルは、ルートの `.env` ファイルから自動生成できます。これにより、環境変数を変更するだけで TOML ファイルを更新できます。

### 必要な環境変数

ルートの `.env` ファイルに以下の環境変数を設定してください：

```bash
# 必須項目
SHOPIFY_APP_URL=https://your-app-url.trycloudflare.com
APP_NAME=your-app-name
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SCOPES=read_products,write_products
SHOPIFY_API_VERSION=2025-10

# オプション項目
SHOPIFY_DEV_STORE_URL=your-dev-store.myshopify.com
```

**環境変数の説明:**

- `SHOPIFY_APP_URL`: アプリのベースURL（末尾の `/` は自動的に削除されます）
- `APP_NAME`: アプリ名
- `SHOPIFY_API_KEY`: Shopify API キー（`client_id` として使用されます）
- `SHOPIFY_API_SCOPES`: 必要なスコープ（カンマ区切り）
- `SHOPIFY_API_VERSION`: Webhook の API バージョン（例: `2025-10`）
- `SHOPIFY_DEV_STORE_URL`: 開発用ストアのURL（オプション）

### TOML ファイルの生成

以下のコマンドで `shopify.app.toml` を生成します：

```bash
pnpm run sync:shopify-app-toml
```

このコマンドは、ルートの `.env` ファイルを読み込み、`shopify.app.toml` を生成します。

**オプション:**

- `--env <path>`: `.env` ファイルのパスを指定（デフォルト: `./.env`）
- `--out <path>`: 出力先のパスを指定（デフォルト: `./shopify.app.toml`）
- `--check`: 生成結果と既存ファイルが一致するかチェックのみ（CI向け）

**例:**

```bash
# デフォルトのパスを使用
pnpm run sync:shopify-app-toml

# カスタムパスを指定
node scripts/generate-shopify-app-toml.cjs --env ./.env.local --out ./shopify.app.toml

# CI でチェックのみ
node scripts/generate-shopify-app-toml.cjs --check
```

**注意:**

- `redirect_urls` は自動的に以下の3つのパスが生成されます：
  - `/auth/callback`
  - `/auth/shopify/callback`
  - `/api/auth/callback`
- `SHOPIFY_APP_URL` の末尾に `/` がある場合は自動的に削除されます。
- 生成されたファイルには、直接編集しないよう警告コメントが含まれます。

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

### API バージョン更新が必要になるケース（重要）

`pnpm run graphql-codegen` は Shopify のスキーマ（`admin-graphql-direct-proxy`）を参照して型生成しますが、Shopify 側で古い API バージョンが無効化されると、以下のように失敗することがあります：

- `Failed to load schema ... {"error":"Invalid API version"}`

この場合は **プロジェクト内で参照している Admin API バージョンを最新版（または有効なバージョン）へ揃える**必要があります。

**更新箇所（例）:**
- `web/codegen.ts`: `https://shopify.dev/admin-graphql-direct-proxy/<API_VERSION>`
- `.graphqlrc.yml`: `schema: "https://shopify.dev/admin-graphql-direct-proxy/<API_VERSION>"`
- `web/app/hooks/useGraphQL.ts`: `shopify:admin/api/<API_VERSION>/graphql.json`
- `shopify.app.toml`: `[webhooks].api_version`

**揃える基準:**
- アプリ本体の API バージョンは `web/lib/shopify/initialize-context.ts` の `apiVersion`（例: `ApiVersion.October25`）に合わせてください。

更新後に、もう一度 `pnpm run graphql-codegen` を実行してください。

---

## Cloudflare Tunnel で固定サブドメインを使う（オプション）

開発時に、ngrok の一時URLではなく、固定のサブドメイン（例: `dev.example.com`）を公開URLとして使いたい場合の設定方法です。

### 前提条件

- **ドメインを所有している**（例: `example.com`）
- **ドメインがCloudflareで管理されている**（ネームサーバーをCloudflareに設定済み）
- **Cloudflareアカウント**があること

### 概要

この手順では、Cloudflare Tunnel（Zero Trust）を使って、ローカル開発環境（`localhost:3000` など）を固定のサブドメイン（例: `app.enprods.com`）で外部公開します。

**重要な注意点:**
- `--tunnel-url` オプションは**使用しません**（このオプションは Shopify CLI が管理するトンネル用です）
- Cloudflare Tunnel を使う場合は、`shopify.app.toml` の `application_url` を設定し、`automatically_update_urls_on_dev = false` にします
- その後、通常の `shopify app dev` コマンドを実行します

---

### ステップ1: cloudflared のインストール

```bash
# macOS (Homebrew)
brew install cloudflare/cloudflare/cloudflared

# または公式インストーラー
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

インストール確認:
```bash
cloudflared --version
```

---

### ステップ2: Cloudflare にログインしてトンネルを作成

```bash
# Cloudflare アカウントでログイン
cloudflared tunnel login
```

ブラウザが開くので、使用するドメイン（例: `example.com`）を選択して認証を完了します。これにより、認証証明書が `~/.cloudflared/cert.pem` に保存されます。

次に、トンネルを作成します:

```bash
# トンネル名は任意（例: shopify-dev）
cloudflared tunnel create shopify-dev
```

実行すると、トンネルID（UUID）が表示されます。このIDは後で使用します。

---

### ステップ3: ダッシュボード管理に移行する（ローカル設定の場合）

既にローカル設定ファイルでトンネルを作成している場合、ダッシュボード管理に移行すると、設定をダッシュボードから直接管理できるようになります（推奨）。

#### 移行前の確認

移行には以下の条件を満たす必要があります：

1. **トンネルが起動していて、ステータスが healthy である**
   ```bash
   # トンネルを起動していることを確認
   cloudflared tunnel run shopify-dev
   ```

2. **YAML設定ファイルで設定されている**
   - `~/.cloudflared/config.yml` または特定の設定ファイルが存在し、`ingress` ルールが定義されている

3. **cloudflared のバージョンが 2022.03 以降**
   ```bash
   cloudflared --version
   # 例: cloudflared version 2024.x.x (またはそれ以降)
   ```

#### 移行手順

1. [Cloudflare Zero Trust ダッシュボード](https://one.dash.cloudflare.com/) にログイン
2. **Networks** → **Tunnels** を選択
3. 作成したトンネル（例: `shopify-dev`）をクリック
4. 「Migrate shopify-dev」という画面が表示される場合、移行の条件を確認
5. 条件を満たしている場合、**Start migration** ボタンをクリック

**重要:** 移行は**不可逆的（irreversible）**です。移行後は、ダッシュボードから設定を管理することになります。ローカル設定ファイルの変更はダッシュボードに反映されません。

移行後は、ダッシュボードから直接 Public Hostname を追加・編集・削除できるようになります。

---

### ステップ4: Public Hostname の設定

トンネルの設定方法には、**ダッシュボード管理**と**ローカル設定ファイル**の2つの方法があります。

#### 方法A: ダッシュボードで管理する（推奨・簡単）

ダッシュボード管理に移行済み、または新規作成時:

1. [Cloudflare Zero Trust ダッシュボード](https://one.dash.cloudflare.com/) にログイン
2. **Networks** → **Tunnels** を選択
3. トンネル（例: `shopify-dev`）をクリック
4. **Public Hostnames** タブを選択
5. **Add a public hostname** をクリック
6. 以下のように設定:
   - **Subdomain**: `dev`
   - **Domain**: `<あなたのドメイン>`（例: `example.com`）
   - **Service**: `http://localhost:3000`（Next.jsのデフォルトポート）
7. **Save hostname** をクリック

これにより、`dev.<ドメイン>` が `localhost:3000` にルーティングされるようになります。DNSレコードはCloudflareが自動で作成します（通常、CNAMEレコード）。

移行済みの場合、これ以降の設定はすべてダッシュボードから管理できます。

#### 方法B: ローカル設定ファイルを使う（ダッシュボード管理に移行しない場合）

ダッシュボード管理に移行せず、ローカル設定ファイルで管理し続ける場合。詳細設定が必要な場合にも使用できます。

**注意:** ダッシュボード管理に移行済みの場合は、この方法は不要です。ダッシュボードから直接設定を管理してください。

---

### ステップ5: トンネル設定ファイルの作成（ローカル設定の場合・移行しない場合のみ）

ダッシュボード管理を使わず、ローカル設定ファイルで管理する場合:

#### 設定ファイルの場所

デフォルトでは `~/.cloudflared/config.yml` を参照します。または、トンネルごとに設定ファイルを作成することもできます。

#### 設定ファイルの例

`~/.cloudflared/config.yml` を作成（または既存のファイルを編集）:

```yaml
tunnel: <TUNNEL_ID>  # ステップ2で取得したUUID
credentials-file: /Users/<ユーザー名>/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: dev.<ドメイン>
    service: http://localhost:3000
  - service: http_status:404
```

`<TUNNEL_ID>` と `<ユーザー名>` を実際の値に置き換えてください。

#### DNSレコードの手動設定（ローカル設定の場合）

設定ファイルを使う場合、DNSレコードを手動で設定する必要があります：

1. Cloudflare ダッシュボードの **DNS** セクションに移動
2. レコードを追加:
   - **Type**: `CNAME`
   - **Name**: `dev`
   - **Target**: `<TUNNEL_ID>.cfargotunnel.com`
   - **Proxy status**: プロキシ有効（オレンジの雲アイコン）

または、コマンドで設定:

```bash
cloudflared tunnel route dns shopify-dev dev.<ドメイン>
```

**注意:** ダッシュボード管理を使用する場合は、この手順は不要です。ダッシュボードが自動的にDNSレコードを作成します。

---

### ステップ6: トンネルを起動

```bash
# トンネル名を指定して起動
cloudflared tunnel run shopify-dev

# または設定ファイルがある場合
cloudflared tunnel run
```

トンネルが起動すると、`dev.<ドメイン>` が `localhost:3000` に接続されます。

**重要:** このトンネルは **Shopify CLI を起動する前に** 実行しておく必要があります。

バックグラウンドで実行したい場合:
```bash
# macOS/Linux (nohup使用)
nohup cloudflared tunnel run shopify-dev > /dev/null 2>&1 &

# またはsystemd等でサービス化することも可能
```

---

### ステップ7: shopify.app.toml の設定

固定URLを使う場合は、`shopify.app.toml` を更新する必要があります。以下の2つの方法があります：

#### 方法A: 手動で編集する

```toml
# shopify.app.toml
application_url = "https://<あなたのドメイン>"

[auth]
redirect_urls = [
  "https://<あなたのドメイン>/auth/callback",
  "https://<あなたのドメイン>/auth/shopify/callback",
  "https://<あなたのドメイン>/api/auth/callback"
]

[build]
# 固定URLを使う場合は false に設定する
automatically_update_urls_on_dev = false
```

#### 方法B: 環境変数から自動生成する（推奨）

ルートの `.env` ファイルに以下の環境変数を設定します：

```bash
SHOPIFY_APP_URL=https://<あなたのドメイン>
APP_NAME=your-app-name
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SCOPES=read_products,write_products
SHOPIFY_API_VERSION=2025-10
SHOPIFY_DEV_STORE_URL=your-dev-store.myshopify.com  # オプション
```

その後、以下のコマンドで `shopify.app.toml` を生成します：

```bash
pnpm run sync:shopify-app-toml
```

詳細は「[shopify.app.toml の生成](#shopifyapptoml-の生成)」セクションを参照してください。

---

### ステップ8: Shopify CLI で開発サーバーを起動

**重要:** Cloudflare Tunnel を使う場合、`--tunnel-url` オプションは**使用しません**。このオプションは Shopify CLI が管理するトンネル用です。

#### 手順（順序が重要）

**ターミナル1: Cloudflare Tunnel を起動**
```bash
cloudflared tunnel run shopify-dev
```

トンネルが正常に起動すると、以下のようなメッセージが表示されます：
```
+------------------------------------------------------------+
|  Your quick Tunnel has been created!                       |
|  Visit it at (it may take some time to be reachable):      |
|  https://app.enprods.com                                   |
+------------------------------------------------------------+
```

**ターミナル2: Shopify CLI で開発サーバーを起動**
```bash
# ルートディレクトリで実行
shopify app dev
```

**起動の順序:**
1. **まず** Cloudflare Tunnel を起動（ターミナル1）
2. **次に** Shopify CLI を起動（ターミナル2）

**重要なポイント:**
- `shopify.app.toml` の `automatically_update_urls_on_dev = false` に設定されているため、Shopify CLI は `application_url` の値をそのまま使用します
- `--tunnel-url` オプションは**使わない**でください（Cloudflare Tunnel には対応していません）
- トンネルは**事前に起動しておく**必要があります
- Next.js 開発サーバーが `localhost:3000` で起動していることを確認してください

**動作確認:**
1. ターミナル1でトンネルが起動していることを確認
2. ターミナル2で Next.js サーバーが起動していることを確認（`http://localhost:3000` にアクセス可能）
3. ブラウザで `https://app.enprods.com` にアクセスして、アプリが表示されることを確認

---

### 確認

1. トンネルが起動していることを確認（ターミナルで `cloudflared tunnel run` のプロセスが動いている）
2. `https://dev.<ドメイン>` にブラウザでアクセスし、Next.jsアプリが表示されることを確認
3. Shopify CLIを起動し、正常にアプリがインストールできることを確認

---

### 注意点とトラブルシューティング

#### Cloudflare Access について

Cloudflare Access（認証保護）を有効にしている場合、Webhookの受信などで問題が発生する可能性があります。開発環境では、Accessを無効にするか、Webhookエンドポイントを例外に追加してください。

#### ポート番号の確認

**重要:** Next.js は固定ポート（3000）で起動する必要があります。Cloudflare Tunnel の Public Hostname の Service URL は `http://localhost:3000` に設定されているため、Next.js も同じポートで起動する必要があります。

**設定方法:**
- `web/package.json` の `dev` スクリプトに `-p 3000` を追加済みです
- これにより、Next.js は常にポート 3000 で起動します

**確認方法:**
- `shopify app dev` を実行した際のログで、`Local: http://localhost:3000` と表示されることを確認してください
- もし別のポート（例: `62490`）で起動している場合は、Cloudflare Tunnel の Public Hostname の Service URL をそのポートに変更するか、Next.js の設定を確認してください

#### HTTPS について

Cloudflareは自動的にHTTPS証明書を発行しますが、反映まで数分かかる場合があります。証明書が発行されるまで待つか、CloudflareダッシュボードのSSL/TLS設定を確認してください。

#### トンネルが接続できない / "refused to connect" エラー

`app.enprods.com refused to connect` というエラーが表示される場合、以下の点を確認してください：

**1. Cloudflare Tunnel が起動しているか確認**
```bash
# トンネルが起動しているか確認
cloudflared tunnel list

# または、別のターミナルでトンネルを起動
cloudflared tunnel run shopify-dev
```

**2. Next.js 開発サーバーが起動しているか確認**
- `shopify app dev` を実行しているターミナルで、Next.js サーバーが起動していることを確認
- `http://localhost:3000` に直接アクセスして、Next.js アプリが表示されるか確認

**3. Cloudflare ダッシュボードで Public Hostname の設定を確認**
1. [Cloudflare Zero Trust ダッシュボード](https://one.dash.cloudflare.com/) にログイン
2. **Networks** → **Tunnels** → トンネル名をクリック
3. **Public Hostnames** タブを確認
4. 以下の設定になっているか確認：
   - **Subdomain**: `app`（または適切なサブドメイン）
   - **Domain**: `enprods.com`
   - **Service**: `http://localhost:3000`（Next.js のデフォルトポート）
   - **Status**: Active（緑色）

**4. ポート番号の確認**
- Next.js が別のポート（例: `3001`）で起動している場合、Public Hostname の Service URL を `http://localhost:3001` に変更

**5. トンネルのログを確認**
```bash
# トンネルを起動したターミナルで、エラーメッセージがないか確認
cloudflared tunnel run shopify-dev
```

**6. 接続テスト**
```bash
# ローカルで Next.js が起動しているか確認
curl http://localhost:3000

# Cloudflare Tunnel 経由でアクセスできるか確認（トンネルが起動している状態で）
curl https://app.enprods.com
```

**よくある原因:**
- トンネルが起動していない
- Next.js 開発サーバーが起動していない
- Public Hostname の Service URL が間違っている（例: `https://localhost:3000` になっている）
- ポート番号が一致していない

#### ローカル設定のトンネルをダッシュボード管理に移行したい場合

ダッシュボードでトンネルを開いた際に「Migrate shopify-dev」という画面が表示される場合、以下の条件を満たす必要があります:

1. トンネルのステータスが **healthy** である
2. トンネルが **YAML設定ファイル**で設定されている
3. `cloudflared` のバージョンが **2022.03以降**である（`cloudflared --version` で確認）

条件を満たしている場合は「Start migration」をクリックして移行できます。移行は**不可逆的**なので注意してください。

移行後は、ダッシュボードから直接Public Hostnameを管理できるようになります。

#### DNSの反映待ち

DNSレコードの反映には数分〜数時間かかる場合があります。`dig dev.<ドメイン>` または `nslookup dev.<ドメイン>` でDNSの反映を確認してください。

---

### デフォルトのトンネル方式（ngrok/trycloudflare）に戻す場合

固定サブドメインを使わず、デフォルトの自動生成URLに戻したい場合:

1. `shopify.app.toml` の `automatically_update_urls_on_dev` を `true` に変更：
   ```toml
   [build]
   automatically_update_urls_on_dev = true
   ```

2. 通常通り起動：
   ```bash
   pnpm run dev
   ```

または、環境変数から `shopify.app.toml` を再生成する場合：

```bash
# .env ファイルで SHOPIFY_APP_URL を削除またはコメントアウト
# その後、shopify.app.toml を手動で編集して automatically_update_urls_on_dev = true に設定
```

---

## 開発サーバーの起動

すべてのセットアップが完了したら、開発サーバーを起動します。

### 方法1: デフォルトのトンネルを使用（推奨・初回）

Shopify CLIが自動的にトンネル（ngrok/trycloudflare）を設定します。

#### 1. プロジェクトのルートディレクトリに戻る

```bash
# プロジェクトのルートディレクトリに移動
cd ..
```

#### 2. 開発サーバーを起動

```bash
pnpm run dev
```

**このコマンドは以下を実行します:**
- Shopify CLI が環境変数を自動設定
- Next.js 開発サーバーが起動
- トンネル（ngrok/trycloudflare）が自動的に設定され、Shopify アプリに接続

**初回起動時:**
- ブラウザが自動的に開きます
- Shopify アプリのインストール画面が表示されます
- 開発用ストアを選択してインストールを完了してください

**正常に起動すると:**
- ターミナルに開発サーバーの URL が表示されます
- 例: `https://xxxx-xxxx-xxxx.ngrok.io` または `https://xxxx-xxxx-xxxx.trycloudflare.com`

#### 3. アプリの確認

ブラウザでアプリが開き、Shopify 管理画面に埋め込まれたアプリが表示されます。

---

### 方法2: Cloudflare Tunnel で固定サブドメインを使う

固定のサブドメイン（例: `app.enprods.com`）を使いたい場合は、上記の「[Cloudflare Tunnel で固定サブドメインを使う（オプション）](#cloudflare-tunnel-で固定サブドメインを使うオプション)」セクションを参照してください。

**前提条件:**
- Cloudflare Tunnel が起動している必要があります
- `shopify.app.toml` の `application_url` が固定URLに設定されていること
- `shopify.app.toml` の `automatically_update_urls_on_dev = false` に設定されていること

**起動方法:**
```bash
# ターミナル1: トンネルを起動
cloudflared tunnel run shopify-dev

# ターミナル2: Shopify CLIで開発サーバーを起動
shopify app dev
```

**注意:** `--tunnel-url` オプションは**使用しません**。Cloudflare Tunnel を使う場合は、`shopify.app.toml` の `application_url` が使用されます。

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

### 問題2.1: `shopify app generate` を実行するとヘルプだけ表示される

例:

```bash
shopify app generate
```

これはエラーではなく、`generate` が **拡張機能（extension）生成** の入口コマンドになっているためです。

**解決方法（アプリを新規作成したい場合）:**

```bash
shopify app init
```

**解決方法（拡張機能を作りたい場合）:**

```bash
shopify app generate extension
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
docker compose down
docker compose up -d
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

### 問題9: `docker-compose: command not found`

macOS + zsh で `docker-compose` を実行すると、以下のように表示されることがあります：

```bash
zsh: command not found: docker-compose
```

**解決方法（推奨）:** `docker compose`（スペースあり）を使用してください。

```bash
docker compose up -d
docker compose down
```

**補足（どうしても `docker-compose` を使いたい場合）:**
- Docker Desktop を最新版に更新し、`docker compose version` が動くことを確認してください
- 互換のためにエイリアスを貼ることもできます（例）:

```bash
alias docker-compose="docker compose"
```

### 問題10: Cloudflare Tunnel で接続できない

Cloudflare Tunnel を使っている場合に発生する可能性のある問題：

**確認事項:**
1. トンネルが起動しているか確認
   ```bash
   cloudflared tunnel list
   ```
2. `shopify.app.toml` の `application_url` が正しいか確認
3. `shopify.app.toml` の `automatically_update_urls_on_dev = false` に設定されているか確認
4. `shopify.app.toml` の `application_url` と `redirect_urls` が一致しているか確認

**解決方法:**
```bash
# トンネルを再起動（別ターミナル）
cloudflared tunnel run shopify-dev

# Shopify CLIを起動（別ターミナル）
# --tunnel-url オプションは使わない
shopify app dev
```

**DNSの反映待ち:**
- DNSレコードの反映には数分〜数時間かかる場合があります
- `dig <ドメイン>` または `nslookup <ドメイン>` でDNSの反映を確認してください

**Cloudflare Access が有効な場合:**
- Webhookの受信などで問題が発生する場合は、Cloudflare Accessを無効にするか、Webhookエンドポイントを例外に追加してください

### 問題11: 拡張機能の `uid` エラーが発生する

`shopify app dev` を実行した際に以下のエラーが表示される場合：

```
Your app has extensions which need to be assigned `uid` identifiers.
```

**原因:**
- Shopify Partners ダッシュボードから移行したアプリで、拡張機能（extensions）に `uid` が割り当てられていない場合に発生します

**解決方法:**
1. 初回のみ、対話的にデプロイを実行して拡張機能に `uid` を割り当てます：
   ```bash
   shopify app deploy
   ```
   - `--force` オプションは**付けない**でください
   - 対話的に拡張機能の `uid` をマッピングする画面が表示されます
   - 各拡張機能に対して適切な `uid` を選択または作成してください

2. デプロイが完了したら、通常通り開発サーバーを起動できます：
   ```bash
   shopify app dev
   ```

**注意:** このエラーは初回のみ発生します。一度 `uid` が割り当てられれば、以降は通常通り開発できます。

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

