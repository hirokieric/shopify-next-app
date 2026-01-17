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

この手順では、Cloudflare Tunnel（Zero Trust）を使って、ローカル開発環境（`localhost:3000` など）を固定のサブドメイン `dev.<ドメイン>` で外部公開します。Shopify CLIの `--tunnel-url` オプションと組み合わせて使用します。

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

### ステップ3: Public Hostname の設定（Cloudflare ダッシュボード）

1. [Cloudflare Zero Trust ダッシュボード](https://one.dash.cloudflare.com/) にログイン
2. **Networks** → **Tunnels** を選択
3. 作成したトンネル（例: `shopify-dev`）をクリック
4. **Public Hostnames** タブを選択
5. **Add a public hostname** をクリック
6. 以下のように設定:
   - **Subdomain**: `dev`
   - **Domain**: `<あなたのドメイン>`（例: `example.com`）
   - **Service**: `http://localhost:3000`（Next.jsのデフォルトポート）
7. **Save hostname** をクリック

これにより、`dev.<ドメイン>` が `localhost:3000` にルーティングされるようになります。DNSレコードはCloudflareが自動で作成します（通常、CNAMEレコード）。

---

### ステップ4: トンネル設定ファイルの作成（オプション）

明示的に設定ファイルを使いたい場合、`~/.cloudflared/config.yml` を作成:

```yaml
tunnel: <TUNNEL_ID>  # ステップ2で取得したUUID
credentials-file: /Users/<ユーザー名>/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: dev.<ドメイン>
    service: http://localhost:3000
  - service: http_status:404
```

**注意:** 設定ファイルを使わない場合でも、ダッシュボードでPublic Hostnameを設定すれば動作します。

---

### ステップ5: トンネルを起動

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

### ステップ6: shopify.app.toml の更新

固定URLを使う場合は、`shopify.app.toml` を手動で更新します。

```toml
# shopify.app.toml
application_url = "https://dev.<ドメイン>"

[auth]
redirect_urls = [
  "https://dev.<ドメイン>/auth/callback",
  "https://dev.<ドメイン>/auth/shopify/callback",
  "https://dev.<ドメイン>/api/auth/callback"
]

[build]
# 固定URLを使う場合は false に設定することを推奨
automatically_update_urls_on_dev = false
```

`<ドメイン>` の部分を実際のドメインに置き換えてください（例: `dev.example.com`）。

---

### ステップ7: Shopify CLI で開発サーバーを起動

トンネルを起動した状態で、以下のコマンドで開発サーバーを起動します:

```bash
# ルートディレクトリで実行
shopify app dev --tunnel-url https://dev.<ドメイン> --no-update
```

**オプションの説明:**
- `--tunnel-url`: 使用するトンネルURLを指定（事前にトンネルが起動している必要がある）
- `--no-update`: `shopify.app.toml` の `application_url` を使用（自動更新を無効化）

または、`package.json` のスクリプトに追加することもできます:

```json
{
  "scripts": {
    "dev": "shopify app dev",
    "dev:cloudflare": "shopify app dev --tunnel-url https://dev.<ドメイン> --no-update"
  }
}
```

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

Next.jsのポートが3000以外の場合、Public HostnameのService URLを変更してください（例: `http://localhost:3001`）。

#### HTTPS について

Cloudflareは自動的にHTTPS証明書を発行しますが、反映まで数分かかる場合があります。証明書が発行されるまで待つか、CloudflareダッシュボードのSSL/TLS設定を確認してください。

#### トンネルが接続できない

- トンネルが起動しているか確認（`cloudflared tunnel list`）
- トンネルIDが正しいか確認
- CloudflareダッシュボードでPublic Hostnameの設定を確認

#### DNSの反映待ち

DNSレコードの反映には数分〜数時間かかる場合があります。`dig dev.<ドメイン>` または `nslookup dev.<ドメイン>` でDNSの反映を確認してください。

---

### デフォルトのトンネル方式（ngrok/trycloudflare）に戻す場合

固定サブドメインを使わず、デフォルトの自動生成URLに戻したい場合:

```bash
# 通常通り起動（トンネルオプションなし）
pnpm run dev
```

または、`shopify.app.toml` の `automatically_update_urls_on_dev` を `true` に戻してください。

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

固定のサブドメイン（例: `dev.example.com`）を使いたい場合は、上記の「[Cloudflare Tunnel で固定サブドメインを使う（オプション）](#cloudflare-tunnel-で固定サブドメインを使うオプション)」セクションを参照してください。

**前提条件:**
- Cloudflare Tunnel が起動している必要があります
- `shopify.app.toml` を固定URL用に更新済みであること

**起動方法:**
```bash
# トンネルを起動（別ターミナル）
cloudflared tunnel run shopify-dev

# Shopify CLIで開発サーバーを起動（別ターミナル）
shopify app dev --tunnel-url https://dev.<ドメイン> --no-update
```

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
2. `--tunnel-url` オプションで指定したURLが正しいか確認（`https://dev.<ドメイン>` 形式であること）
3. `shopify.app.toml` の `application_url` と `redirect_urls` が一致しているか確認

**解決方法:**
```bash
# トンネルを再起動
cloudflared tunnel run shopify-dev

# Shopify CLIを起動する際は、トンネルが起動している状態で実行
shopify app dev --tunnel-url https://dev.<ドメイン> --no-update
```

**DNSの反映待ち:**
- DNSレコードの反映には数分〜数時間かかる場合があります
- `dig dev.<ドメイン>` または `nslookup dev.<ドメイン>` でDNSの反映を確認してください

**Cloudflare Access が有効な場合:**
- Webhookの受信などで問題が発生する場合は、Cloudflare Accessを無効にするか、Webhookエンドポイントを例外に追加してください

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

