export class Config {
  static get defaultImageModelIds() {
    return ["1", "3", "19"]
  }

  static get defaultImageModelId() {
    return "1"
  }

  /**
   * パスの仕様: 認証バッジ
   */
  static get passFeature() {
    return {
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
    }
  }

  static mediaQuery = {
    isDesktop: "(min-width: 768px)",
  }

  static get logEvent() {
    return {
      page_view: "page_view",
      share: "share",
      select_item: "select_item",
      login: "login",
    } as const
  }

  static generation = {
    defaultImageModelIds: ["1", "3", "19"],
    defaultImageModelId: "1",
    defaultPromptValue: "",
    defaultNegativePromptValue: "",
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
    vaeValues: ["kl-f8-anime2", "ClearVAE_V2.3"],
    sizeValues: [
      "SD1_512_512",
      "SD1_512_768",
      "SD1_768_512",
      "SD2_768_768",
      "SD2_768_1200",
      "SD2_1200_768",
    ],
  }

  /**
   * デフォルトのLoRAモデルID
   */
  static get defaultImageLoraModelIds() {
    return ["25", "26"]
  }

  static get currentWebSiteURL() {
    return "https://www.aipictors.com"
  }

  static get siteNameJA() {
    return "AIピクターズ"
  }

  static get siteNameEN() {
    return "Aipictors"
  }

  static get siteTitleJA() {
    return `${Config.siteNameJA} - ${Config.siteCatchphraseJA}`
  }

  static get siteTitleEN() {
    return `${Config.siteNameEN} - ${Config.siteCatchphraseEN}`
  }

  static get siteTitleTemplateJA() {
    return "%s | AIイラスト・小説投稿サイト"
  }

  static get siteCatchphraseJA() {
    return "AIイラスト・小説投稿サイト"
  }

  static get siteCatchphraseEN() {
    return "AI Illustration & Novel"
  }

  static get siteDescriptionJA() {
    return "AIイラスト・小説投稿サイト「AIピクターズ」で作品を公開してみよう!、AIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。"
  }

  /**
   * Firebaseの設定
   */
  static get firebaseConfig() {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
  }

  static googleAdsenseClient = "ca-pub-2116548824296763"

  /**
   * GraphQLのエンドポイント
   */
  static get graphqlEndpoint() {
    return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!
  }

  static wordpressPrivateImageEndpoint =
    "https://www.aipictors.com/wp-content/themes/AISite/private-image.php"

  static wordpressWWW4Endpoint = "https://www4.aipictors.com/index.php"

  static wordpressUploadPrivateImageEndpoint =
    "https://www.aipictors.com/wp-content/themes/AISite/upload-private-image.php"

  /**
   * Sentry: DSN
   */
  static get sentryDSN() {
    return process.env.NEXT_PUBLIC_SENTRY_DSN!
  }

  /**
   * Sentry: 環境
   */
  static get sentryEnvironment() {
    return process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!
  }

  /**
   * Sentry: バージョン
   */
  static get sentryRelease() {
    return process.env.NEXT_PUBLIC_SENTRY_RELEASE!
  }

  /**
   * サイトのURL
   */
  static get siteURL() {
    return process.env.NEXT_PUBLIC_APP_URL!
  }

  /**
   * クライアントサイドである
   */
  static get isClient() {
    return typeof window !== "undefined"
  }

  /**
   * サーバーサイドである
   */
  static get isNotClient() {
    return typeof window === "undefined"
  }

  /**
   * ローカル環境である
   */
  static get isDevelopmentMode() {
    return process.env.NODE_ENV === "development"
  }

  /**
   * 本番環境である
   */
  static get isReleaseMode() {
    return process.env.NODE_ENV !== "development"
  }
}
