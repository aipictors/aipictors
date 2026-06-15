# プレミアムコイン仕様

## 概要

フリーコインに加え、有償の「プレミアムコイン」を導入します。プレミアムコインは購入・推し送り・Amazon ポイント交換が可能です。

---

## 購入パッケージ

### 定額パッケージ

| パッケージ         | 購入枚数   | ボーナス  | 合計枚数   | 価格   |
| -------------- | -------- | ------- | -------- | ------ |
| PREMIUM_COINS_100   | 100 枚   | 0 枚    | 100 枚   | 80 円  |
| PREMIUM_COINS_1000  | 1,000 枚 | 100 枚  | 1,100 枚 | 800 円 |
| PREMIUM_COINS_10000 | 10,000 枚 | 1,000 枚 | 11,000 枚 | 8,000 円 |

### 任意枚数パッケージ（PREMIUM_COINS_CUSTOM）

- **最低購入枚数**: 100 枚
- **単価**: 1 枚 = 0.8 円（1 円未満切り上げ）
- **ボーナス**: 1,000 枚以上で購入枚数の 10% をボーナス付与
  - 例: 2,000 枚購入 → 200 枚ボーナス → 合計 2,200 枚

### 生成換算

- 10 枚で 1 生成分（フリーコインと同様）

---

## Stripe 連携

### API Endpoints

| 用途                   | エンドポイント                                | メソッド |
| -------------------- | --------------------------------------- | ------ |
| チェックアウト作成            | `/api/stripe/premium-coins-checkout`    | POST   |
| Stripe Webhook 受信     | `/api/stripe/premium-coins-webhook`     | POST   |

### チェックアウト リクエスト仕様

```json
POST /api/stripe/premium-coins-checkout
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

{
  "packageId": "PREMIUM_COINS_1000",
  "customCoins": null
}
```

`packageId` が `PREMIUM_COINS_CUSTOM` の場合は `customCoins`（整数, >= 100）を必須で渡す。

### チェックアウト レスポンス

```json
{
  "error": null,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "coins": 1000,
    "bonusCoins": 100,
    "totalCoins": 1100,
    "priceYen": 800
  }
}
```

### Stripe Webhook URL（Dashboard 設定用）

```
https://www.aipictors.com/api/stripe/premium-coins-webhook
```

プレビュー/開発環境ではドメインを差し替えてください。

#### 購読する Stripe イベント

- `checkout.session.completed`
- `charge.refunded`

### aipictors-api 側の転送先

| 用途                  | パス                                   |
| ------------------- | ------------------------------------- |
| チェックアウトセッション作成      | `POST /stripe/checkout/premium-coins`  |
| Webhook 転送           | `POST /webhooks/stripe/premium-coins`  |
| 推し送り               | `POST /internal/coins/support`         |

---

## 推し機能

ユーザが他ユーザにコインを送ることで「推し」ができます。

### 推し送り API

```
POST /api/coins/support
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

{
  "recipientUserId": "user_xxx",
  "coinType": "FREE" | "PREMIUM",
  "amount": 10
}
```

### pt 計算ルール

| コイン種別         | 1 枚あたり pt |
| -------------- | ----------- |
| フリーコイン         | 1 pt        |
| プレミアムコイン       | 10 pt       |

- **推しランキング（推されたランキング）**: 受け取った pt の合計順
- **貢献度ランキング（推したランキング）**: 送った pt の合計順

### 集計期間

- 1 週間ごと（月曜〜日曜）を 1 期間とし、月 4 回開催
- 期間ごとのランキングデータを保存・参照可能にする

### ランキング保存仕様

- **推しランキング** と **貢献度ランキング** はどちらも週間集計とする
- 受け取った pt と、送った pt は別テーブルで Neon に保存して管理する
- 週間ランキングは各週のスナップショットとして保持し、期間切り替え後も参照できるようにする
- **累計貢献 pt** は別途保持し、ユーザ画面で確認できるようにする
- 表示上は、週間ランキングと累計値を分けて見られるようにする

### backend API

- `POST /internal/coins/support` で支援送信と週次集計の保存を行う
- `GET /internal/coins/support/rankings` で週間ランキングを取得する
- `GET /internal/coins/support/summary/:userId` で累計貢献 pt と週間集計を取得する

### Neon テーブル

- `coin_support_transfers`
- `coin_support_weekly_received_points`
- `coin_support_weekly_sent_points`
- `coin_support_totals`

---

## 消費優先順位

生成時のコイン消費順：

1. **フリーコイン**（残高がある限り優先消費）
2. **プレミアムコイン**（フリーコインが不足した場合に消費）

この優先順位の制御は `aipictors-api` 側で行います。

---

## プレミアムコインの有効期限

- 購入日から **3ヶ月後** に期限切れ
- ロット単位で期限管理（複数回購入した場合はそれぞれ独立）
- 推しで受け取ったプレミアムコインの期限はバックエンドで別途定義

---

## Amazon ギフト券交換

推しによって受け取ったプレミアムコインを Amazonギフト券と交換申請できます。

### 交換パッケージ

| パッケージID    | 消費コイン  | 交換額    |
| ------------ | --------- | -------- |
| AMAZON_1000  | 1,000 枚  | 300 円分  |
| AMAZON_10000 | 10,000 枚 | 3,000 円分 |

### 申請ルール

- **交換対象**: 推しで受け取ったプレミアムコインのみ（購入コインは不�- **交換対象**: 推��- **交換対象**: 推しで受け取ったプレミアムコインのみ: - **交換対�ts` - **交換対象**: 推しで受け取ったプレミアムコインのみ（購入コインは不�- **交�イン残高を確認・ロック・減算
2. 管理者が `/admin/amazon-exchange` で一覧�2. 管理者が `/admin/amazon-exchange` で一覧�2. 管理者が `/admin/amazon-exchange` で一覧�2. 管��2. 管理者が `/admin/amazon-exchange` で一覧�2. 管理�s/p2. �s` の「承認済み」欄�2.コードを確認・コピ�2. 管理者が `/admin/amazon-exchange` で一覧�2. 管理者が `/admin/amazon-exchange` で一メソ�2. 管理者が `/a------------------------ | ------ |
| 申請一覧取得 | `/api/| 申請一覧取得 | `/api/| 申請��| 申請一覧取得 | `/api/| 申請一�` | POST   |

POST body: `{ "packageId": "AMAZON_1000" }`
同時申請上限（3件）を超えた場合は HTTP 409 を返す。

### 管理者向けエンドポイント

| 用途       | エンドポイント                    | メソッド |
| -------- | --------------------------- | ------ |
| 申請一覧取得   | `/api/admin/amazon-exchange` | GET    |
| コード入力・承認 | `/api/admin/amazon-exchange` | POST   |

GET クエリ: `status=PENDING|APPROVED`, `offset`, `limit`
POST body: `{ "requestId": "req_xxx", "amazonGiftCode": "XXXX-XXXXXX-XXXX" }`

管理画面: `/admin/amazon-exchange`

---

## 必要な Cloudflare 環境変数

既存の `points-stripe-integration.md` と共通です。

- `STRIPE_SECRET_KEY`
- `AIPICTORS_API_BASE_URL`
- `AIPICTORS_API_INTERNAL_TOKEN`
- `AIPICTORS_API_CF_ACCESS_CLIENT_ID`（任意）
- `AIPICTORS_API_CF_ACCESS_CLIENT_SECRET`（任意）
- `VITE_GRAPHQL_ENDPOINT_REMIX`

---

## 実装ファイル一覧（フロントエンド側）

| ファイル                                                                             | 役割                         |
| -------------------------------------------------------------------------------- | --------------------------- |
| `app/lib/server/premium-coins.server.ts`                                         | パッケージ定義・ボーナス計算ヘルパー         |
| `app/routes/api.stripe.premium-coins-checkout/route.tsx`                         | プレミアムコイン購入チェックアウト作成        |
| `app/routes/api.stripe.premium-coins-webhook/route.tsx`                          | Stripe Webhook 受信・転送        |
| `app/routes/api.coins.support/route.tsx`                                         | 推し送りAPI                    |
| `app/routes/($lang).settings.points/components/purchase-premium-coins-dialog.tsx` | 購入モーダル（設定ページに表示）          |
| `app/routes/($lang).settings.points/components/points-settings-form.tsx`         | コイン設定ページ（フリー＋プレミアム残高・履歴）  |
| `app/routes/($lang).settings.points/components/amazon-exchange-section.tsx`      | Amazonギフト券交換申請UI（申請・一覧表示）   |
| `app/lib/server/amazon-exchange.server.ts`                                       | 交換パッケージ定義・上限定数             |
| `app/routes/api.coins.amazon-exchange/route.tsx`                                 | ユーザ向け申請GET/POSTエンドポイント     |
| `app/routes/api.admin.amazon-exchange/route.tsx`                                 | 管理者向け一覧取得・承認エンドポイント       |
| `app/routes/($lang)._main.admin.amazon-exchange/route.tsx`                       | 管理画面（申請一覧・コード入力・承認）       |

## バックエンド（aipictors-api）で必要な実装

| エンドポイント                                   | 内容                                          |
| ----------------------------------------- | ------------------------------------------- |
| `POST /stripe/checkout/premium-coins`      | Stripe チェックアウトセッション作成（プレミアムコイン）            |
| `POST /webhooks/stripe/premium-coins`      | Stripe Webhook 受信・コイン付与・期限（3ヶ月）設定           |
| `POST /internal/coins/support`             | 推し送り処理・pt 加算                               |
| コイン消費ロジック                                 | フリーコイン残高があれば先に消費、不足分をプレミアムから消費             |
| ロット管理                                    | 購入ロットごとに `expiresAt = 購入日 + 3ヶ月` を設定        |
