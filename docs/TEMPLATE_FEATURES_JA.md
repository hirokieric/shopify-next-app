# テンプレートの特徴と注意点

このドキュメントでは、このテンプレートの特徴、公式テンプレートとの違い、開発時に注意すべき点について説明します。

## 📋 目次

1. [このテンプレートの特徴](#このテンプレートの特徴)
2. [公式テンプレートとの主な違い](#公式テンプレートとの主な違い)
3. [技術スタックの詳細](#技術スタックの詳細)
4. [アーキテクチャの特徴](#アーキテクチャの特徴)
5. [開発時の注意点](#開発時の注意点)
6. [よくある質問](#よくある質問)

---

## このテンプレートの特徴

### 🎯 主な特徴

1. **Next.js App Router 対応**
   - 最新の Next.js App Router とサーバーコンポーネントを使用
   - サーバーサイドレンダリング（SSR）とクライアントサイドレンダリングの最適な組み合わせ

2. **App Bridge v4 の活用**
   - 最新の App Bridge v4 を使用
   - Direct API Mode による認証の簡素化
   - 新しいインストールフロー（`use_legacy_install_flow = false`）

3. **Token Exchange による認証**
   - セッショントークンを使用した認証フロー
   - サーバーアクションによるトークンの自動交換と保存

4. **Tanstack Query によるデータフェッチング**
   - Apollo Client の代わりに Tanstack Query を使用
   - より軽量で柔軟なデータフェッチング

5. **Prisma によるデータベース管理**
   - 型安全な ORM
   - セッション管理とアプリインストール情報の保存

6. **GraphQL Codegen による型生成**
   - GraphQL クエリとミューテーションの型安全性
   - TypeScript のインテリセンスサポート

---

## 公式テンプレートとの主な違い

### 1. 認証フローの違い

#### このテンプレート
- **Token Exchange を使用**
  - クライアントから ID トークンを取得
  - サーバーアクションでトークンを交換してセッションを保存
  - よりシンプルでモダンな認証フロー

```typescript
// クライアント側（SessionProvider）
app.idToken().then((token) => {
  storeToken(token); // サーバーアクションでトークンを保存
});
```

#### 公式テンプレート
- 従来の OAuth フローを使用
- より複雑な認証手順が必要

### 2. データフェッチングライブラリ

#### このテンプレート
- **Tanstack Query** を使用
  - より軽量
  - キャッシングと状態管理が柔軟
  - カスタムフック（`useGraphQL`）で GraphQL クエリを簡単に実行

```typescript
// Tanstack Query を使用
const { data } = useGraphQL(query, variables);
```

#### 公式テンプレート
- **Apollo Client** を使用
  - より重い
  - GraphQL 専用の機能が豊富

### 3. App Bridge の設定

#### このテンプレート
```toml
[access.admin]
direct_api_mode = "offline"
embedded_app_direct_api_access = true

[access_scopes]
use_legacy_install_flow = false  # 新しいインストールフロー
```

- Direct API Mode を有効化
- 新しいインストールフローを使用
- よりシンプルな設定

#### 公式テンプレート
- 従来の設定が多い
- より複雑な設定が必要な場合がある

### 4. セッション管理

#### このテンプレート
- **Prisma を使用したセッション管理**
  - データベースにセッションを保存
  - オフラインアクセストークンとオンラインアクセストークンの両方をサポート
  - セッションの永続化

```typescript
// セッションをデータベースに保存
await storeSession(session);
```

#### 公式テンプレート
- セッションストレージの実装が異なる場合がある
- ファイルベースやメモリベースのストレージを使用する場合がある

### 5. プロバイダーの構成

#### このテンプレート
```typescript
<TanstackProvider>
  <SessionProvider>
    {children}
  </SessionProvider>
</TanstackProvider>
```

- シンプルなプロバイダー構成
- SessionProvider で自動的にトークンを保存
- Polaris の UI は **Polaris Web Components（`<s-*>`）** を使用し、`layout.tsx` で `polaris.js` を読み込みます

#### 公式テンプレート
- より複雑なプロバイダー構成の場合がある
- Apollo Provider を含む場合がある

---

## 技術スタックの詳細

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.5.4 | フレームワーク |
| React | 19.2.0 | UI ライブラリ |
| TypeScript | 5.9.3 | 型安全性 |
| Polaris Web Components | Shopify CDN | UI コンポーネント（`<s-*>`） |
| Tailwind CSS | 4.1.14 | スタイリング |
| Tanstack Query | 5.90.2 | データフェッチング |
| App Bridge React | 4.2.5 | Shopify 統合 |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Shopify API | 12.0.0 | Shopify API 連携 |
| Prisma | 6.17.0 | ORM |
| GraphQL Codegen | 5.0.7 | 型生成 |

### 開発ツール

| 技術 | 用途 |
|------|------|
| Docker | ローカルデータベース |
| pnpm | パッケージマネージャー |
| GraphQL Codegen | GraphQL 型生成 |

---

## アーキテクチャの特徴

### 1. サーバーアクションの活用

このテンプレートは、Next.js のサーバーアクションを積極的に使用しています。

```typescript
// app/actions.ts
"use server";

export async function storeToken(sessionToken: string) {
  await handleSessionToken(sessionToken, false, true);
}
```

**メリット:**
- クライアントとサーバーの境界が明確
- 型安全な API 呼び出し
- 自動的なエラーハンドリング

### 2. ミドルウェアによるセキュリティ

Content Security Policy (CSP) ヘッダーを自動的に設定します。

```typescript
// middleware.ts
res.headers.set(
  "Content-Security-Policy",
  `frame-ancestors https://${shop} https://admin.shopify.com;`
);
```

### 3. セッション管理の実装

セッションは Prisma を使用してデータベースに保存されます。

```typescript
// lib/db/session-storage.ts
export async function storeSession(session: ShopifySession) {
  await prisma.session.upsert({
    where: { id: session.id },
    // ...
  });
}
```

**特徴:**
- オフラインアクセストークンとオンラインアクセストークンの両方をサポート
- セッションの有効期限管理
- アプリのアンインストール時の自動クリーンアップ

### 4. GraphQL クエリの型安全性

GraphQL Codegen により、GraphQL クエリの型が自動生成されます。

```typescript
// 型安全な GraphQL クエリ
const { data } = useGraphQL<ProductsQuery, ProductsQueryVariables>(
  ProductsDocument,
  { first: 10 }
);
```

---

## 開発時の注意点

### ⚠️ 重要な注意事項

#### 1. 環境変数の管理

- `.env` ファイルは Git にコミットしないでください
- プロダクション環境では、ホスティングサービスの環境変数設定を使用してください
- Shopify CLI が自動的に設定する環境変数もありますが、手動で設定することも可能です

#### 2. データベースマイグレーション

- スキーマを変更したら、必ずマイグレーションを実行してください
- プロダクション環境では、マイグレーションを慎重に実行してください

```bash
cd web
pnpm run migrate
```

#### 3. セッショントークンの扱い

- セッショントークンは機密情報です。ログに出力しないでください
- トークンの有効期限を適切に処理してください
- トークンの検証は必ずサーバー側で行ってください

#### 4. App Bridge の設定

- `shopify.app.toml` の設定を変更する場合は、Shopify Partners ダッシュボードの設定も更新してください
- Direct API Mode を使用する場合、適切なスコープを設定してください

#### 5. GraphQL Codegen の実行

- GraphQL クエリを追加・変更したら、型を再生成してください

```bash
cd web
pnpm run graphql-codegen
```

#### 6. プロダクション環境でのデプロイ

- 環境変数をすべて設定してください
- データベース接続文字列を確認してください
- Shopify Partners ダッシュボードでアプリの URL を更新してください
- Webhook の URL が正しく設定されているか確認してください

#### 7. セキュリティ

- CSP ヘッダーは自動的に設定されますが、必要に応じてカスタマイズしてください
- セッション管理は Prisma を使用していますが、必要に応じて追加のセキュリティ対策を実装してください

#### 8. パフォーマンス

- Tanstack Query のキャッシュ設定を最適化してください
- サーバーコンポーネントとクライアントコンポーネントの使い分けに注意してください
- データベースクエリの最適化を検討してください

---

## よくある質問

### Q1: 公式テンプレートとどちらを使うべきですか？

**A:** 
- **このテンプレートを選ぶ場合:**
  - Next.js App Router の最新機能を使いたい
  - Tanstack Query を使いたい
  - Token Exchange による認証フローを使いたい
  - よりシンプルな構成を好む

- **公式テンプレートを選ぶ場合:**
  - Shopify の公式サポートが必要
  - より保守的なアプローチを好む
  - Apollo Client を使いたい

### Q2: Apollo Client から Tanstack Query への移行は可能ですか？

**A:** はい、可能です。ただし、GraphQL クエリの書き方を変更する必要があります。このテンプレートには `useGraphQL` フックが用意されているので、それを使用してください。

### Q3: データベースは必須ですか？

**A:** セッション管理に Prisma を使用しているため、データベースは必須です。ただし、PostgreSQL 以外のデータベース（MySQL、SQLite など）も使用できます。

### Q4: プロダクション環境でのパフォーマンスは？

**A:** 
- Next.js App Router による最適化
- Tanstack Query による効率的なキャッシング
- サーバーコンポーネントによるパフォーマンス向上

適切に設定すれば、優れたパフォーマンスが期待できます。

### Q5: カスタマイズは容易ですか？

**A:** はい、このテンプレートはシンプルな構成になっているため、カスタマイズが容易です。ただし、認証フローやセッション管理の部分は慎重に変更してください。

### Q6: サポートはありますか？

**A:** このテンプレートはコミュニティベースのテンプレートです。GitHub の Issues や Discussions でサポートを求めることができます。

---

## まとめ

### このテンプレートの強み

✅ Next.js App Router の最新機能を活用  
✅ モダンな認証フロー（Token Exchange）  
✅ 軽量なデータフェッチング（Tanstack Query）  
✅ 型安全な開発環境  
✅ シンプルで理解しやすい構成  

### 注意すべき点

⚠️ 公式テンプレートではないため、公式サポートはありません  
⚠️ データベースが必須です  
⚠️ セッション管理の実装を理解する必要があります  
⚠️ プロダクション環境での設定に注意が必要です  

### 推奨される用途

- 新しい Shopify アプリの開発
- Next.js App Router を活用したいプロジェクト
- モダンな技術スタックを使いたいプロジェクト
- カスタマイズ性を重視するプロジェクト

---

**このテンプレートを使用する際は、上記の注意点を理解し、適切に設定・運用してください。**

