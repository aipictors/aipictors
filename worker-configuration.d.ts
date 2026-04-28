export type Env = {
  /**
   * SSR/Functions 側で使う GraphQL エンドポイント
   * (Vite の import.meta.env と同名で Pages の環境変数にも設定される想定)
   */
  VITE_GRAPHQL_ENDPOINT_REMIX?: string
  /** ブラウザ向け GraphQL エンドポイント（フォールバック用） */
  VITE_GRAPHQL_ENDPOINT?: string
  /** ブラウザ向け動画アップロードエンドポイント（省略時は /api/upload-stream-video） */
  VITE_WORKERS_STREAM_UPLOADER?: string
  /** Cloudflare Stream アップロードAPIで使用するアカウントID */
  CLOUDFLARE_ACCOUNT_ID?: string
  /** Cloudflare Stream アップロードAPIで使用するサーバー側トークン */
  CLOUDFLARE_STREAM_API_TOKEN?: string
  /** Stripe secret key for server-side checkout/webhook */
  STRIPE_SECRET_KEY?: string
  /** Internal aipictors-api base URL */
  AIPICTORS_API_BASE_URL?: string
  /** Internal aipictors-api bearer token */
  AIPICTORS_API_INTERNAL_TOKEN?: string
  /** Optional Cloudflare Access client id for aipictors-api */
  AIPICTORS_API_CF_ACCESS_CLIENT_ID?: string
  /** Optional Cloudflare Access client secret for aipictors-api */
  AIPICTORS_API_CF_ACCESS_CLIENT_SECRET?: string
}
