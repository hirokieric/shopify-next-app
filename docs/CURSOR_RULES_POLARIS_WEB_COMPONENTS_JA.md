# Cursor AI向け補足（Polaris Web Components 版）

このリポジトリは Shopify 埋め込みアプリ（Embedded App）テンプレです。UI レイヤーは **Polaris Web Components（`<s-*>`）** を前提とします。

## Polaris（UI）方針

- **Polaris React（`@shopify/polaris`）は使用しない**
- **Polaris Web Components は CDN から読み込む**
  - `web/app/layout.tsx` の `<head>` に `https://cdn.shopify.com/shopifycloud/polaris.js` を追加して利用する
- **Providers には Polaris 用 Provider を置かない**
  - `web/app/providers/providers.tsx` は `TanstackProvider` → `SessionProvider` を束ねる（UI は `s-*` で表現）

## TSX での `s-*` タグ

- `s-*` を TSX で使うため、`web/types/polaris-web-components.d.ts` で最小限の JSX 型を許可しています。

## i18n

- Polaris React の `AppProvider i18n={...}` は使いません。
- `html lang`（`web/app/layout.tsx`）やアプリ文言側の辞書（JSON）で対応します。

