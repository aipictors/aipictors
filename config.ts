/**
 * 設定
 */
export const config = {
  /**
   * パスの仕様: 認証バッジ
   */
  passFeature: {
    /**
     * 認証バッジ
     */
    badge: {
      free: false,
      lite: true,
      standard: true,
      premium: true,
    },
    /**
     * 広告非表示
     */
    noAdvertisement: {
      free: false,
      lite: true,
      standard: true,
      premium: true,
    },
    /**
     * 1日の画像生成数
     */
    imageGenerationsCount: {
      free: 30,
      lite: 50,
      standard: 100,
      premium: 200,
    },
    /**
     * 画像生成タスク数
     */
    imageGenerationTasksCount: {
      free: 1,
      lite: 1,
      standard: 2,
      premium: 3,
    },
    /**
     * LoRAモデル数
     */
    imageGenerationLoraModelsCount: {
      free: 2,
      lite: 2,
      standard: 5,
      premium: 5,
    },
    /**
     * 画像生成履歴数
     */
    imageGenerationHistoriesCount: {
      free: 0,
      lite: 10,
      standard: 50,
      premium: 100,
    },
  },
  /**
   * メディアクエリ
   */
  mediaQuery: {
    isDesktop: "(min-width: 768px)",
  },
  /**
   * ログイベント
   */
  logEvent: {
    page_view: "page_view",
    share: "share",
    select_item: "select_item",
    login: "login",
  } as const,
  /**
   * 画像生成
   */
  generationFeature: {
    /**
     * デフォルトのモデルのID
     */
    defaultImageModelIds: ["1", "3", "19"],
    /**
     * デフォルトのモデルのID
     */
    defaultImageModelId: "1",
    /**
     * デフォルトのモデルの種別
     */
    defaultImageModelType: "SD1",
    /**
     * デフォルトのLoRAモデル名
     */
    defaultImageLoraModelNames: ["flat1", "flatBG"],
    defaultPromptValue: "",
    defaultNegativePromptValue: "EasyNegative",
    defaultScaleValue: 7,
    defaultStepsValue: 20,
    defaultSamplerValue: "DPM++ 2M",
    samplerValues: [
      "Euler a",
      "Euler",
      "Heun",
      "DPM2",
      "DPM2 a",
      "DPM++ 2S a",
      "DPM++ 2M",
      "LMS Karras",
      "DPM2 a Karras",
      "DPM++ 2S a Karras",
      "DPM++ SDE Karras",
      "DPM++ 2M Karras",
      "DPM++ 2M SDE Karras",
      "DDIM",
    ],
    defaultVaeValue: "kl-f8-anime2",
    vaeValues: ["kl-f8-anime2", "ClearVAE_V2.3", "sdxl_vae"],
    sizeValues: [
      "SD1_512_512",
      "SD1_512_768",
      "SD1_768_512",
      "SD2_768_768",
      "SD2_768_1200",
      "SD2_1200_768",
      "SD1_384_960",
      "SD1_960_384",
      "SD3_1024_1024",
      "SD3_832_1216",
      "SD3_1216_832",
      "SD3_640_1536",
      "SD3_1536_640",
    ],
  },
  /**
   * サイト
   */
  metadata: {
    nameJA: "AIピクターズ",
    nameEN: "Aipictors",
    get titleJA() {
      return `${this.nameJA} - ${this.catchphraseJA}`
    },
    get titleEN() {
      return `${this.nameEN} - ${this.catchphraseEN}`
    },
    titleTemplateJA: "%s | Aipictors | AI画像投稿サイト・生成サイト",
    catchphraseJA: "AI画像投稿サイト・生成サイト",
    catchphraseEN: "AI Illustration & Generation",
    descriptionJA:
      "AI画像投稿サイト・生成サイト「AIピクターズ」で作品を公開してみよう!、AIイラスト・AIフォト・AIグラビア・AI小説・ショート動画投稿サイトです。",
  },
  /**
   * Firebaseの設定
   */
  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  /**
   * Googleアドセンス
   */
  googleAdsense: {
    /**
     * クライアントID
     */
    client: "ca-pub-2116548824296763",
  },
  /**
   * GraphQLのエンドポイント
   */
  graphql: {
    endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
  },
  /**
   * ワードプレス
   */
  wordpressEndpoint: {
    siteURL: "https://www.aipictors.com",
    privateImage:
      "https://www.aipictors.com/wp-content/themes/AISite/private-image.php",
    www4: "https://www4.aipictors.com/index.php",
    uploadPrivateImage:
      "https://www.aipictors.com/wp-content/themes/AISite/upload-private-image.php",
  },
  /**
   * Sentry
   */
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE!,
  },
  /**
   * サイトのURL
   */
  siteURL: process.env.NEXT_PUBLIC_APP_URL!,
  /**
   * ローカル環境である
   */
  isDevelopmentMode: process.env.NODE_ENV === "development",
  /**
   * 本番環境である
   */
  isReleaseMode: process.env.NODE_ENV !== "development",
}
