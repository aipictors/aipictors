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
    return "AIイラスト・小説投稿サイト「AIピクターズ」で作品を公開してみよう！、AIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。"
  }

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

  static get graphqlEndpoint() {
    return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!
  }

  static get sentryDSN() {
    return process.env.NEXT_PUBLIC_SENTRY_DSN!
  }

  static get sentryEnvironment() {
    return process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!
  }

  static get sentryRelease() {
    return process.env.NEXT_PUBLIC_SENTRY_RELEASE!
  }

  static get appURL() {
    return process.env.NEXT_PUBLIC_APP_URL!
  }

  static get isClient() {
    return typeof window !== "undefined"
  }

  static get isNotClient() {
    return typeof window === "undefined"
  }

  static get isDevelopmentMode() {
    return process.env.NODE_ENV === "development"
  }

  static get isReleaseMode() {
    return process.env.NODE_ENV !== "development"
  }
}
