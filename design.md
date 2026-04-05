# Design System — Shopify App (Polaris)

Shopify App を Polaris で構築する際のデザインシステム。
Polaris をそのまま使うと「シンプルすぎて逆に見づらい」問題を解決するためのルール集。

---

## Tech Stack

```html
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
<script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
```

- Polaris Web Components (`<s-*>` タグ) — 2025年10月GA、公式推奨
- App Bridge CDN — 同じく `cdn.shopify.com/shopifycloud/` から配信
- カスタムCSS — Polaris トークン (`--p-*`) を使って wrapper 要素にのみ適用

### CDN の制約

- `<s-*>` コンポーネント自体の CSS は変更不可（マーチャントのブランド設定を継承）
- `className` / `style` props は存在しない（Shopify の方針）
- カスタムスタイルは wrapper `<div>` に対して Polaris トークンで適用する

### React Polaris は使わない

React Polaris (`@shopify/polaris`) は deprecated 予定。新規アプリでは使わない。
本ドキュメントは Polaris Web Components (`<s-*>`) のみを対象とする。

レイアウトの構造説明では概念名（Card, Page, IndexTable 等）を使うが、
実装は全て Web Components で行う:

| 概念                  | Web Component                  | 備考                                  |
| --------------------- | ------------------------------ | ------------------------------------- |
| Page                  | `<s-page>`                     | `heading`, `slot="primary-action"` 等 |
| Card / Section        | `<s-section>`                  | Card相当のグルーピング                |
| 垂直スタック          | `<s-stack>`                    | `direction="block"`（デフォルト）     |
| 横並び                | `<s-stack direction="inline">` |                                       |
| グリッド              | `<s-grid>`                     | `columns={N}`                         |
| AnnotatedSection      | カスタムCSS 2カラム            | Web Components に直接対応なし         |
| テーブル / IndexTable | `<s-table>`                    |                                       |
| テキスト入力          | `<s-text-field>`               |                                       |
| ボタン                | `<s-button>`                   | `variant`, `tone`                     |
| バッジ                | `<s-badge>`                    | `tone`                                |
| バナー                | `<s-banner>`                   | `tone`                                |
| 区切り線              | `<s-divider>`                  |                                       |
| モーダル              | `<s-modal>`                    | `command`, `commandFor`               |

---

## 「シンプルすぎる」問題の原因と対策

### 原因

1. **フラットなカード積み** — 全カードが同じ重み、階層なし
2. **スペーシングが均一** — gap が全部同じで情報のグルーピングが伝わらない
3. **テキスト階層の欠如** — 見出し・本文・キャプションの区別が弱い
4. **表面レイヤーの未活用** — 背景色が全部白で奥行きがない
5. **状態表現の不足** — Badge, Banner, ProgressBar 等のステータス表示がない

### 対策の原則

**スペーシングで階層を作る（最重要）**

3段階のスペーシングを使い分けることで、同じコンポーネントでも情報構造が伝わる。
具体的なトークンは「Spacing Tokens」セクションを参照。

ルール: **深くネストするほど gap を小さくする**

---

## Color Tokens

### Surface Layering（奥行きを作る）

| Token                            | Role                                 |
| -------------------------------- | ------------------------------------ |
| `--p-color-bg`                   | ページ背景（最も暗いグレー #f6f6f7） |
| `--p-color-bg-surface`           | カード表面（白 #ffffff）             |
| `--p-color-bg-surface-secondary` | ネストされた表面（やや暗い）         |
| `--p-color-bg-surface-tertiary`  | 3段目のネスト                        |

ページ背景 → カード → カード内セクションの3層で奥行きを表現する。全部白にしない。

### Semantic Colors

| Role       | Usage                  |
| ---------- | ---------------------- |
| `info`     | 情報・ニュートラル通知 |
| `success`  | 完了・正常状態         |
| `warning`  | 注意・確認が必要       |
| `critical` | エラー・重大な問題     |
| `magic`    | AI 機能                |

テキスト・背景・ボーダーそれぞれに `--p-color-text-{role}`, `--p-color-bg-fill-{role}`, `--p-color-border-{role}` が存在する。

### Text Hierarchy

| Token                      | Role               |
| -------------------------- | ------------------ |
| `--p-color-text`           | プライマリテキスト |
| `--p-color-text-secondary` | 説明、キャプション |
| `--p-color-text-disabled`  | 無効状態           |

---

## Typography

フォント: Inter（システムフォールバック付き）。Major Third スケール (1.2x)。

| Token               | Size | Usage                |
| ------------------- | ---- | -------------------- |
| `--p-font-size-750` | 30px | ページタイトル       |
| `--p-font-size-600` | 24px | セクション見出し     |
| `--p-font-size-500` | 20px | カード見出し         |
| `--p-font-size-400` | 16px | 本文（base）         |
| `--p-font-size-350` | 14px | 本文（small）        |
| `--p-font-size-300` | 12px | キャプション、ラベル |

### Weight

| Weight     | Value | Usage                    |
| ---------- | ----- | ------------------------ |
| `bold`     | 700   | ページタイトル           |
| `semibold` | 600   | セクション・カード見出し |
| `medium`   | 500   | 強調テキスト             |
| `regular`  | 400   | 本文                     |

### 階層を作るルール

- 見出しは必ず本文より2段階以上大きくする（例: 500 + 350）
- キャプション (`font-size-300`) + secondary color でメタ情報を表示
- 数字を目立たせる: `font-size-600` + `semibold` で KPI を表示

---

## Spacing Tokens

Base unit: 4px。トークン名 = 倍率。

| Token           | px   | Usage                          |
| --------------- | ---- | ------------------------------ |
| `--p-space-050` | 2px  | 極小（アイコン内余白）         |
| `--p-space-100` | 4px  | ラベルと値の間                 |
| `--p-space-200` | 8px  | 関連要素のグループ内           |
| `--p-space-300` | 12px | カード内要素間                 |
| `--p-space-400` | 16px | カードの padding、セクション間 |
| `--p-space-500` | 20px | カード padding (sm+)           |
| `--p-space-600` | 24px | 大きなセクション間             |
| `--p-space-800` | 32px | ページセクション間             |

### レイアウト要素ごとの余白

| 要素             | 余白                                          |
| ---------------- | --------------------------------------------- |
| Card間           | 16-20px (`space-400` - `space-500`)           |
| Card内セクション | 20-24px（Dividerなし、余白でグルーピング）    |
| AnnotatedSection | 左1/3 + 右2/3、ガター32px、セクション間32px   |
| IndexTable行高   | 50px（サムネなし）/ 56px（サムネあり）        |
| フォーム要素内   | ラベル-入力-ヘルプ間 4-8px、フィールド間 16px |

### Shadow Tokens

| Token            | Usage              |
| ---------------- | ------------------ |
| `--p-shadow-100` | 軽い浮き（ホバー） |
| `--p-shadow-200` | カードのデフォルト |
| `--p-shadow-300` | ポップオーバー     |
| `--p-shadow-400` | モーダル           |

---

## Page Header Design

公式アプリ共通のページヘッダー構造:

```
[backAction ← ] [Page Title]                    [secondaryActions] [primaryAction]
```

- **primaryAction**: 常に右端、黒ボタン（`variant="primary"`）。"Create workflow", "Add filter" 等
- **secondaryActions**: primaryの左（outlined）。"Export", "Import", "View" 等
- **backAction**: サブページでは必ず設置（← 矢印でワンレベル上に戻る）
- **「...」メニュー**: ページヘッダー最右端。Manage app / Get support / Review app / Uninstall を格納
  - destructive アクション（Uninstall）は赤色で最下部

```html
<s-page heading="Filters">
  <s-link slot="breadcrumb-actions" href="/apps/my-app">My App</s-link>
  <s-button slot="primary-action" variant="primary">Add filter</s-button>
  <s-button slot="secondary-actions">View</s-button>
  <s-section>...</s-section>
</s-page>
```

### ボタン配置ルール（全画面共通）

| 場所           | パターン                                             |
| -------------- | ---------------------------------------------------- |
| ページレベル   | primaryAction（右端黒）+ secondaryActions（その左）  |
| Card内         | CTAはEmptyState内部に配置                            |
| 保存           | ページ右下に固定。未変更時は disabled（グレー）      |
| 削除           | "Save" の左に赤い "Remove" ボタン                    |
| 管理系         | Popover「...」メニュー内。destructive は赤色で最下部 |
| 外部プレビュー | "View" ボタンとして secondaryActions に配置、新タブ  |

---

## Layout Patterns

### Page Types

| Type            | Structure                  | When                      |
| --------------- | -------------------------- | ------------------------- |
| Dashboard       | 1カラム、Card垂直スタック  | ホーム、分析              |
| Index/List      | 1カラム + IndexTable       | 一覧ページ                |
| Detail/Edit     | 1カラム、複数Card          | 詳細・編集ページ          |
| Settings        | AnnotatedSection (2カラム) | 設定ページ                |
| Resource detail | 2/3 + 1/3 columns          | 商品詳細、注文詳細        |
| 中間ナビ        | 1カラム + Card内リスト     | サブページが2-3個ある場合 |

### Dashboard — 2つのパターン

**パターンA: 初期案内型（Flow方式）**

初回利用者をテンプレートやチュートリアルに誘導:

```
Page (primaryAction なし)
 +-- Card — EmptyState（イラスト + 見出し + 説明 + CTA）
 +-- Card — News（内部2カラムグリッド、子カード2枚）
 +-- Card — Featured templates（内部4カラムグリッド）
```

**パターンB: KPIダッシュボード型（Search & Discovery方式）**

オンボーディングチェックリスト + パフォーマンスメトリクス:

```
Page
 +-- Card — オンボーディング（進捗インジケーター + チェックリスト）
 +-- セクション見出し（"Search performance" + 日付範囲）
 +-- InlineGrid columns={2} — KPIカード群（Click rate / Purchase rate）
 +-- InlineGrid columns={3} — サブKPIカード群
```

**パターンC: 通常のダッシュボード**

```
s-page
 +-- s-banner (tone="info") — 通知・セットアップガイド
 +-- s-grid columns={2}
 |    +-- s-section — KPI（大きな数字 + トレンド s-badge）
 |    +-- s-section — KPI
 +-- s-section — メインコンテンツ（s-table or チャート）
 |    +-- s-stack gap="base"
 |         +-- s-stack direction="inline" justifyContent="space-between"
 |         |    +-- s-heading level={2}
 |         |    +-- s-button
 |         +-- s-divider
 |         +-- コンテンツ本体
 +-- s-section — プロモーション（控えめに）
```

### Index/List Recipe

一覧ページの構造:

```
Page (title + primaryAction + secondaryActions)
 +-- Card
      +-- Tabs ("All" / "Custom" 等) — 同一テーブルのビュー切り替え
      +-- フィルタ: 検索 + フィルタ + ソート のアイコンボタン（Tabバー右端）
      +-- IndexTable
      |    +-- ヘッダー行（sortable カラム）
      |    +-- データ行（チェックボックス + Thumbnail + テキスト + Badge）
      +-- ページネーション（< > 矢印）
```

一覧ページの選択判断:

| データ形式            | コンポーネント          | 例                                 |
| --------------------- | ----------------------- | ---------------------------------- |
| 構造化データ（行×列） | IndexTable              | Filters, Product boosts            |
| ビジュアルブラウズ    | カードグリッド（3-4列） | テンプレート一覧                   |
| サブカテゴリ2-3個     | Card内リスト            | Search → Product boosts / Synonyms |

### Detail/Edit Recipe

情報の役割ごとに Card を分離:

```
Page (title + backAction)
 +-- Card — 読み取り専用情報（Thumbnail + 名前 + 価格）
 +-- Card — 編集セクションA
 |    +-- タイトル + 説明
 |    +-- TextField（検索）+ Button（"Browse"）横並び
 |    +-- EmptyState or リスト
 +-- Card — 編集セクションB
 |    +-- 番号付きリスト + Badge（"Auto-generated"）
 |    +-- Checkbox（"Hide auto-generated..."）
 +-- InlineStack justifyContent="end"
      +-- Button variant="destructive" — "Remove"
      +-- Button variant="primary" disabled — "Save"
```

フォーム要素の配置: ラベル → 入力 → ヘルプテキスト の垂直スタック。

### Settings Recipe

**AnnotatedSection（2カラム）— 複数セクションの設定:**

```
Page (title + backAction)
 +-- Layout
      +-- AnnotatedSection
      |    +-- 左 (1/3): 見出し "Filters" + 説明テキスト
      |    +-- 右 (2/3): Card
      |         +-- RadioButton グループ（Hide / Show at end / Show default）
      +-- AnnotatedSection
           +-- 左: 見出し "Search relevance" + 説明
           +-- 右: Card
                +-- Checkbox グループ（Products / Pages / Blog posts）
                +-- Checkbox グループ（Predictive search results）
                +-- RadioButton グループ（Out of stock products）
 +-- Button variant="primary" disabled — "Save"（右下固定）
```

**1カラム + Card内リスト — 操作型の設定:**

```
Page (title + backAction)
 +-- Card (title + 説明)
      +-- リスト行（Divider区切り）
           +-- Thumbnail（アプリアイコン）+ テキスト（名前 + 説明）+ Button（"Connect"）
```

### Resource Detail Recipe

```
s-page
 +-- div.layout-two-thirds (カスタムCSS 2カラム: 2/3 + 1/3)
      +-- div.main
      |    +-- s-section — メイン情報
      |    |    +-- s-stack gap="base"
      |    |         +-- セクション A
      |    |         +-- s-divider
      |    |         +-- セクション B
      |    +-- s-section — 追加情報
      +-- div.aside
           +-- s-section — ステータス
           +-- s-section — メタ情報
```

### 中間ナビゲーション Recipe

サブページが2-3個ある場合のハブページ:

```
Page (title + backAction, primaryAction なし)
 +-- Card
      +-- リスト行（Divider区切り）
           +-- アイコン（丸背景）+ テキスト（名前 bold + 説明 subdued）+ 右端にカウント
```

行クリックでサブページへ遷移。

### Card 内の構成ルール

```
s-section
 +-- s-stack gap="base"                         <- セクション間
      +-- s-stack gap="small"                   <- グループ内
      |    +-- s-heading level={3}
      |    +-- s-text type="subdued"
      +-- s-divider
      +-- s-stack gap="small"
           +-- s-stack direction="inline" gap="small"  <- ラベル+値
           |    +-- s-icon
           |    +-- s-text
           +-- s-stack direction="inline" gap="small"
                +-- s-icon
                +-- s-text
```

---

## Effective Components（見落としがちだが効果大）

コンポーネント名と Web Components の対応は「Tech Stack」セクションの対応表を参照。

### ステータス表現

| Component  | Usage                             |
| ---------- | --------------------------------- |
| `s-badge`  | ステータスラベル。`tone` で色分け |
| `s-banner` | ページレベル通知。dismissible     |

### EmptyState の4段階

| レベル         | 場面                     | 構成                                                     |
| -------------- | ------------------------ | -------------------------------------------------------- |
| 1 (フル)       | ページ主要機能が空       | Card内にイラスト + 見出し + 説明 + CTAボタン             |
| 2 (ミディアム) | タブ内・セクション内が空 | テキストのみ（見出し + 説明 + 代替リンク）、イラストなし |
| 3 (ミニ)       | 依存フィールド未設定     | Card内ミニEmptyState（イラスト + 短い説明、CTAなし）     |
| 4 (テキスト)   | プラン制限等の制約       | テキストのみ（見出し + 説明 + インラインリンク）         |

- レベル1: ページヘッダーの primaryAction を省略し、EmptyState内のCTAに一本化してもよい
- レベル2: タブ切り替え後の空状態。"No product boosts" + 説明 + "All products" ボタン

---

## KPI / メトリクスカードのパターン

「シンプルすぎる」の最大要因は数値の見せ方:

```
s-section
 +-- s-stack gap="small"
      +-- s-text type="subdued"                    <- ラベル（小さく）
      |    "Total Orders"
      +-- s-stack direction="inline" gap="small" alignItems="baseline"
      |    +-- s-heading level={1}                 <- 数字（大きく）
      |    |    "1,247"
      |    +-- s-badge tone="success"              <- トレンド
      |         "+12.3%"
      +-- s-text type="subdued"                    <- 補足
           "vs last month"
```

- 数字は大きい heading で表示
- ラベルは `type="subdued"` で控えめに
- s-badge でトレンドを色付き表示
- s-grid で 2-4 列に並べる

---

## Data Visualization

チャートは `@shopify/polaris-viz` を使う。Chart.js / Recharts 等の汎用ライブラリは使わない。

Storybook: polaris-viz.shopify.dev

---

## Custom CSS Rules

### 許可

- wrapper `<div>` に Polaris トークン (`--p-*`) を使ったスタイル
- `Box` の props（background, padding, shadow, borderRadius）
- 独自セクションの背景色・間隔調整

### 禁止

- `<s-*>` コンポーネントの内部スタイル上書き
- Polaris 内部クラス名 (`Polaris-*`) のターゲット
- トークン外のハードコード値（`var(--p-color-text)` を使う）
- `!important`

### 例

```css
.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--p-space-400);
}

.stat-highlight {
  background: var(--p-color-bg-surface);
  padding: var(--p-space-400);
  border-radius: var(--p-border-radius-200);
  border: 1px solid var(--p-color-border);
}
```

---

## Navigation Patterns

### アプリ内ナビゲーション構造

```
Navigation (左サイドバー)
 └── Apps
      └── My App（ハイライト）
           ├── Sub Page A    ← subNavigationItems（インデント表示）
           ├── Sub Page B
           └── Settings
```

- サブメニューは4項目以内
- アプリ名ヘッダー + 「...」メニューは App Bridge が自動提供

### 画面階層の典型構造

```
Dashboard（トップ）
├── 一覧ページ（IndexTable）
│   ├── 詳細/編集（フォーム）← 行クリック
│   └── 新規作成（フォーム）← primaryAction
├── 中間ナビ（Card内リスト）← 子ページが2-3個
│   ├── サブ一覧A
│   └── サブ一覧B
└── Settings（AnnotatedSection）
```

### 遷移パターン

- **一覧 → 詳細**: 行クリックで遷移、backAction（← 矢印）で戻る
- **中間ナビ**: サイドバーには親のみ表示、子ページはCard内リンク
- **"View" ボタン**: ストアフロントプレビューを別タブで開く
- **フルスクリーン**: テンプレートブラウズ等、サイドバーが消える全画面モード

### ページ下部の共通パターン

すべてのページに "Learn more about [機能名]" リンクを中央揃えで配置。

---

## Anti-Patterns

| Anti-Pattern                 | Fix                                          |
| ---------------------------- | -------------------------------------------- |
| Card を同サイズで並べる      | InlineGrid で 2/3+1/3、メインを大きく        |
| gap が全部 `400`             | 100/200/400 の3段階を使い分ける              |
| 見出しと本文が同サイズ       | 見出しは本文より2段階以上大きく              |
| 全部白背景                   | bg → bg-surface → bg-surface-secondary の3層 |
| Badge/Banner を使わない      | ステータスには semantic color + Badge        |
| EmptyState が1パターンだけ   | 4段階を場面に応じて使い分ける                |
| Divider なしのカード         | BlockStack + Divider (Bleed) で区切る        |
| 全ページ fullWidth           | detail は 2/3+1/3 レイアウト                 |
| Chart.js / Recharts          | polaris-viz を使う                           |
| 設定を1ページに詰め込む      | AnnotatedSection + Collapsible               |
| Save ボタンが常に active     | 未変更時は disabled。変更検知で active に    |
| primaryAction が不明確       | 右端に黒ボタン1つ。迷ったら公式アプリを参照  |
| ページ下部にヘルプリンクなし | "Learn more about [機能名]" を中央揃え       |
| 一覧ページにタブがない       | "All" / "Custom" 等のビュー切り替えを検討    |

---

## Checklist

- [ ] ページ背景 (`bg`) とカード (`bg-surface`) で奥行きがあるか
- [ ] スペーシングが3段階で使い分けられているか
- [ ] テキスト階層が3レベル以上あるか
- [ ] ステータスに Badge / Banner を使っているか
- [ ] 数字は大きく、ラベルは控えめか
- [ ] Card 内で Divider でセクション分離しているか
- [ ] 空状態に EmptyState（適切なレベル）を用意しているか
- [ ] ページヘッダーに primaryAction + backAction があるか
- [ ] Save ボタンは右下固定、未変更時 disabled か
- [ ] ページ下部に "Learn more" リンクがあるか
- [ ] カスタム CSS は Polaris トークンのみか

---

## Sources

- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [Using Polaris Components](https://shopify.dev/docs/api/app-home/using-polaris-components)
- [App Home Overview](https://shopify.dev/docs/api/app-home)
- [App Design Guidelines](https://shopify.dev/docs/apps/design)
- [App Home Patterns](https://shopify.dev/docs/api/app-home/patterns/templates/homepage)
- [Polaris Viz](https://github.com/Shopify/polaris-viz)
- 公式アプリ分析: Shopify Flow, Shopify Search & Discovery (2026-04)
