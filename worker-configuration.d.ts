type Env = {
  /**
   * SSR/Functions 側で使う GraphQL エンドポイント
   * (Vite の import.meta.env と同名で Pages の環境変数にも設定される想定)
   */
  VITE_GRAPHQL_ENDPOINT_REMIX?: string
  /** ブラウザ向け GraphQL エンドポイント（フォールバック用） */
  VITE_GRAPHQL_ENDPOINT?: string
}
