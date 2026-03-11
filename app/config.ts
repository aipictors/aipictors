import { env } from "~/env"

type CacheControlConfig = {
  home: string
  short: string
  tenSeconds: string
  oneMinute: string
  oneHour: string
  oneDay: string
  oneWeek: string
  oneMonth: string
}

type AppConfig = {
  cacheControl: CacheControlConfig
  fcm: {
    vapidKey: string
  }
  passFeature: {
    badge: Record<"free" | "lite" | "standard" | "premium", boolean>
    noAdvertisement: Record<"free" | "lite" | "standard" | "premium", boolean>
    imageGenerationsCount: Record<"free" | "lite" | "standard" | "premium", number>
    imageGenerationTasksCount: Record<"free" | "lite" | "standard" | "premium", number>
    imageGenerationLoraModelsCount: Record<"free" | "lite" | "standard" | "premium", number>
    imageGenerationHistoriesCount: Record<"free" | "lite" | "standard" | "premium", number>
  }
  post: {
    maxImageCount: number
  }
  internalApiEndpoint: {
    promptsCheck: string
  }
  logEvent: {
    page_view: string
    share: string
    select_item: string
    login: string
  }
  generationFeature: {
    defaultImageModelIds: string[]
    imageGenerationMaxSteps: number
    imageGenerationMinSteps: number
    defaultImageModelId: string
    defaultImageModelType: string
    defaultFavoritedModelIds: string[]
    defaultImageLoraModelNames: string[]
    defaultPromptValue: string
    defaultNegativePromptValue: string
    defaultScaleValue: number
    defaultStepsValue: number
    defaultSamplerValue: string
    defaultClipSkipValue: number
    samplerValues: string[]
    defaultVaeValue: string
    vaeValues: string[]
    clipSkipValues: number
    sizeValues: string[]
    defaultIsUseRecommendedPrompt: boolean
    defaultI2iImageBase64: string
    defaultI2iDenoisingStrengthSize: number
    defaultThumbnailSizeInPromptView: number
    defaultThumbnailSizeInHistoryListFull: number
    defaultThumbnailType: string
    randomPrompts: string[]
  }
  firebaseConfig: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId: string
  }
  cms: {
    microCms: {
      apiKey: string
    }
  }
  googleAdsense: {
    client: string
  }
  graphql: {
    endpoint: string
  }
  query: {
    maxLimit: number
    generationTasksMaxLimit: number
    homeWorkCount: Record<string, number>
    defaultOffsetMax: number
    offsetMax: number
  }
  uploader: {
    uploadImage: string
    uploadText: string
  }
  downloader: {
    corsDownload: string
  }
  wordpressLink: {
    top: string
  }
  siteURL: string
  isDevelopmentMode: boolean
  defaultOgpImageUrl: string
  defaultSensitiveOgpImageUrl: string
  isReleaseMode: boolean
}

/**
 * 設定
 */
export const config: AppConfig = {
  cacheControl: {
    get home(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get short(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get tenSeconds(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get oneMinute(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get oneHour(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get oneDay(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get oneWeek(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
    get oneMonth(): string {
      return "no-store, no-cache, must-revalidate, max-age=0"
    },
  },
  fcm: {
    get vapidKey(): string {
      return "BOvVhnNNznMu2HYzfZVdJa5hQwnAQW5Prld1gboUgkRY3rO6d3oLMP3WP0bKazNWm9AVI0LBQ8L94FTbN_Y4rn4"
    },
  },
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
      free: 10,
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
   * 投稿の仕様
   */
  post: {
    maxImageCount: 200,
  },
  /**
   * 内部API（未設定の場合は空文字）
   */
  internalApiEndpoint: {
    promptsCheck: "",
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
    imageGenerationMaxSteps: 30,
    imageGenerationMinSteps: 9,
    /**
     * デフォルトのモデルのID
     */
    defaultImageModelId: "1",
    /**
     * デフォルトのモデルの種別
     */
    defaultImageModelType: "SD1",
    /**
     * デフォルトの生成パラメータ
     */
    defaultFavoritedModelIds: [],
    defaultImageLoraModelNames: ["flat1", "flatBG"],
    defaultPromptValue:
      "masterpiece, best quality, extremely detailed, anime, girl, skirt",
    defaultNegativePromptValue: "EasyNegative, bad_prompt_version2, badhandv4",
    defaultScaleValue: 7,
    defaultStepsValue: 20,
    defaultSamplerValue: "DPM++ 2M Karras",
    defaultClipSkipValue: 2,
    samplerValues: [
      "Euler a",
      "Euler",
      "Heun",
      "DPM2",
      "DPM2 a",
      "DPM++ 2S a",
      "LMS Karras",
      "DPM2 a Karras",
      "DPM++ 2S a Karras",
      "DPM++ SDE Karras",
      "DPM++ 2M Karras",
      "DPM++ 2M SDE Karras",
      "DDIM",
    ],
    defaultVaeValue: "vae-ft-mse-840000-ema-pruned",
    vaeValues: [
      "kl-f8-anime2",
      "clearvae_v23",
      "sdxl_vae",
      "vae-ft-mse-840000-ema-pruned",
      "None",
    ],
    clipSkipValues: 2,
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
    defaultIsUseRecommendedPrompt: false,
    defaultI2iImageBase64: "",
    defaultI2iDenoisingStrengthSize: 0.5,
    defaultThumbnailSizeInPromptView: 7,
    defaultThumbnailSizeInHistoryListFull: 7,
    defaultThumbnailType: "light",
    /**
     * ランダム生成プロンプト一覧
     */
    randomPrompts: [
      "masterpiece, best quality, extremely",
      "(photorealistic:1.4),(RAW photo),yellow eyes,green eyes  ,odd eyes,ikemen <lora:flat2:1> <lora:flat1:1>",
      "dream pretty magic light,radiate dream pretty magic,masterpiece, best quality, extremely detailed, anime, pretty little girl,dream pretty dress, twintail, puff sleeve, pink hair, blue eyes, fantasy, watercolor, colorful, dream pretty magical girl,dream pretty ojou-sama, dream pretty butterfly,dream pretty star,dream pretty starry sky,great joy,smile",
      "(monocle),sauvage,maid,long pink hair,masterpiece, best quality, extremely detailed, anime, smile,depth of field, dynamic angle, dutch angle ,looking at viewer,in royal palace,from below<lora:flatBG:-0.7> <lora:hairdetailer:1>",
      "dream pretty Drink,dream pretty town in the background, dream pretty dress, dream pretty ,🦄,unicorn stuffed animal,masterpiece, best quality, extremely detailed, anime, dream pretty,pretty little girl, ponytail, puff sleeve,pastel pink hair,pastel green eyes, colorful, watercolor,great joy,light smile,peaceful,sit, flower,fluttering white petals,from the side",
      "masterpiece, best quality, beautiful illustration, 1girl, solo,(best quality), (ultra-detailed:1.2),(illustration),((gothic lolita girl),((Lolita style)),{(wide angle view:1.2), (long shot, wide shot:1.3), |}(short girl:1.2) (loli:1.2) (chibi:1.2) (short stature:1.1) (child girl:1.1) (toddlercon:1.1) (toddler body:1.1) (loli face:1.2) (baby face:1.1) (4yo:1.1),(beautiful detailed eyes:1.1), (highlight in eyes:1.2),(long wavy hair:1.3), (gradient hair:1.3), (((tareme))),(pink head hair:1.1), (cat ears:1.0), (nekomimi:1.0),happy, smile,((pink frilled dress)), lolita dress, happy, surprise, blush, sitting, full body,outdoor, forest, blue sky, sakura, <lora:boldline:0.8> <lora:lightline:0.2>",
      "(extremely detail game illustration:1.2), masterpiece, (insanely detailed:1.1), detail quality best quality, (very detailed:1.1), (best shadow:1.2) highly detailed light reflection, harmonious, extremely detail background, ultra-detailed, high resolution, production official art, caustics +, very detailed, illustration, novel illustration, Lustrous skin, best shadow, adorable anime round face, vivid contrasting portrait, with healthy pretty anime style makeup, masterpiece, best quality, extremely detailed, anime, masterpiece, best quality, extremely detailed, anime, (violet theme:1.6), horror, (hell), (In western-style house:1.3), (violet light:1.2), (night:1.3), mystical, devil girl, (demon tail), (bat wings on waist:1.2), Beautiful girl alone, (kawaii), cute little, loli face, 16yr old, (Bright bronze hair:1.3), (Medium Hair:1.3), A detailed face, smile, close mouth, (Orange Eyes), (Braids:1.2), medium breasts, Lustrous skin, Skindentation, from front, from above, full body shot, (long shot:1.3), indoor, (standing:1.1), maid costume, (red gotic lolite fashion), red and black dress, puffy short sleeves, (long length), frills, win red tired layers skirt, maid headdress, Giving a slight bow, skirt hold, <lora:flat2:-0.5> <lora:saturation:0.7>",
      "Gaogaigar,giant robot,giant mecha,golden body,golden lion,golden wings,golden drill,green crystal,giant golden hammer,masterpiece, best quality, extremely detailed, anime,orange eyes,golden tornado,golden storm",
      "dynamic angle,Hatsune Miku,chibi character,singing,microphone,(((monochrome))),(((monochrome illustration))),spread both arms,((((colorful musical notes)))),(((neon colored music notes))),cute dress,Live stage,neon color lighting,(green eyes),masterpiece, best quality, extremely detailed, anime,pretty little girl, great joy,smile,:d,<lora:hairdetailer:0> <lora:brighter-eye2:0.7>",
      "(masterpiece, best quality, elaborately crafted costumes, rich in details and textures, perfect anatomy, beautiful eyes, anime:1.25),(depth of field, dynamic angle, cinematic lighting:1.24),Firefighter, fire hose, a man, the man is 27 years old, frown, bravely, messy hair, short hair, (blond hair:1.3), (brown eyes:1.3), fire suit, Fire fighting",
      "masterpiece, best quality, extremely detailed, anime <lora:hairdetailer:1> <lora:make25d_type1_v100:1> , boy, shorthair, black hair, cool, glasses",
      "girl,school uniform,long hair,beauty,black hair,blunt bangs,woman,slimbody,hiah quality,streight hair, slender",
      "girl,school uniform,bob cut,black hair,blunt bangs,beauty,woman,slim body,slender,high quality",
      "the cut up figs, a cool boy, good-looking guy, handsome man, shorthair, long sleeve, silver hair, white hair, red eyes, ikemen",
    ],
  },
  /**
   * Firebaseの設定
   */
  firebaseConfig: {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  /**
   * CMS
   */
  cms: {
    /**
     * MicroCMS
     */
    microCms: {
      /**
       * APIキー
       */
      apiKey:
        import.meta.env.MODE === "development"
          ? env.VITE_MICRO_CMS_API_KEY
          : ((import.meta.env.VITE_MICRO_CMS_API_KEY ?? "") as string),
    },
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
    get endpoint(): string {
      if (typeof document === "undefined") {
        return env.VITE_GRAPHQL_ENDPOINT_REMIX
      }
      return env.VITE_GRAPHQL_ENDPOINT
    },
  },
  /**
   * クエリ
   */
  query: {
    maxLimit: 800,
    generationTasksMaxLimit: 200,
    /**
     * ホームの作品一覧数
     */
    homeWorkCount: {
      ad: 16,
      novel: 16,
      video: 16,
      column: 16,
      generation: 16,
      promotion: 16,
      newUser: 16,
      award: 16,
      tag: 13,
    },
    /**
     * 未ログインでのOFFSETの最大値
     */
    defaultOffsetMax: 64 * 24,
    /**
     * ログイン済みでのOFFSETの最大値
     */
    offsetMax: 64 * 24,
  },
  uploader: {
    uploadImage: env.VITE_WORKERS_UPLOADER,
    uploadText: env.VITE_WORKERS_TEXT_UPLOADER,
  },
  downloader: {
    corsDownload:
      (env.VITE_WORKERS_CORS_DOWNLOAD ??
        "https://aipictors-cors-download.aipictors.workers.dev") as string,
  },
  /**
   * ワードプレスリンク
   */
  wordpressLink: {
    top: "https://legacy.aipictors.com",
  },
  /**
   * サイトのURL
   */
  siteURL: env.VITE_APP_URL,
  /**
   * ローカル環境である
   */
  isDevelopmentMode: import.meta.env.MODE === "development",
  /**
   * デフォルトのOGP画像
   */
  defaultOgpImageUrl:
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg",
  /**
   * デフォルトのセンシティブOGP画像
   */
  defaultSensitiveOgpImageUrl:
    "https://assets.aipictors.com/aipictors_sensitive_image.webp",
  /**
   * 本番環境である
   */
  isReleaseMode: import.meta.env.MODE !== "development",
}

/**
 * キーコードの型定義
 */
export enum KeyCodes {
  Q = "KeyQ",
  E = "KeyE",
  F = "KeyF",
  ALLOW_LEFT = "ArrowLeft",
  ALLOW_RIGHT = "ArrowRight",
  ESCAPE = 27,
}

export interface MetaData {
  title?: string
  enTitle?: string
  description?: string
  enDescription?: string
  image?: string | null
  isIndex?: boolean
  isTop?: boolean
  ogp?: {
    title?: string
    description?: string
    image?: string | null
  }
}

/**
 * Meta information settings
 */
export const META: { [key: string]: MetaData } = {
  ALBUMS: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  HOME: {
    title: "ホーム",
    enTitle: "Home",
    description:
      "AI画像投稿サイト・生成サイト「Aipictors」で作品を公開してみよう!最新のAIイラストを楽しむことができます、グラビアからイラストまでジャンルは様々！無料でイラスト生成することもできます！",
    enDescription:
      "Aipictors is an AI image posting and generation site. You can enjoy the latest AI illustrations, from gravure to illustrations. You can also generate illustrations for free!",
    isIndex: true,
  },
  HOME_2D: {
    title: "イラスト一覧",
    enTitle: "Illustration List",
    description: `The latest AI illustration list of ${new Date().getFullYear()}! Check out popular works created with various models!`,
    enDescription: `The latest AI illustrations from ${new Date().getFullYear()}! Discover popular creations with different models!`,
    isIndex: true,
  },
  HOME_3D: {
    title: "フォト一覧",
    enTitle: "Photo List",
    description: `The latest 3D and photo images of ${new Date().getFullYear()}! Check out popular works created with various models!`,
    enDescription: `The latest 3D and photographic images from ${new Date().getFullYear()}! Discover popular works created with different models!`,
    isIndex: true,
  },
  HOME_SENSITIVE: {
    title: "センシティブ一覧",
    enTitle: "Sensitive List",
    description: `The latest sensitive images of ${new Date().getFullYear()}! Check out popular works created with various models!`,
    enDescription: `The latest sensitive content from ${new Date().getFullYear()}! Explore popular sensitive works generated by AI!`,
    isIndex: true,
  },
  RELEASES: {
    title: "リリース情報",
    enTitle: "Release Information",
    description: "Check the latest release information of Aipictors",
    enDescription: "Stay updated on the latest Aipictors release information",
    isIndex: true,
  },
  ROADMAP: {
    title: "ロードマップ",
    enTitle: "Roadmap",
    description: "AIpictorsの歩みと展望 - これまでの軌跡と今後の開発計画",
    enDescription:
      "Aipictors Journey and Vision - Past milestones and future development plans",
    isIndex: true,
  },
  MILESTONES: {
    title: "開発予定",
    enTitle: "Development Milestones",
    description: "Check the latest development roadmap of Aipictors",
    enDescription: "Explore the latest development plans for Aipictors",
    isIndex: true,
  },
  EVENTS: {
    title: "イベント一覧",
    enTitle: "Event List",
    description: `Check out the latest AI illustration events in ${new Date().getFullYear()}`,
    enDescription: `Discover the latest AI illustration events happening in ${new Date().getFullYear()}`,
    isIndex: true,
  },
  EVENTS_INDEX: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  RANKINGS: {
    title: "ランキング",
    enTitle: "Rankings",
    description: "Check Aipictors ranking information",
    enDescription: "View the ranking information of Aipictors",
    isIndex: true,
  },
  THEMES: {
    title: "お題",
    enTitle: "Themes",
    description:
      "Themes are updated daily. Create and post AI illustrations based on the theme! Updated at midnight.",
    enDescription:
      "Daily themes updated. Create and share your AI illustrations based on today's theme! Updates at midnight.",
    isIndex: true,
  },
  ABOUT: {
    title: "このサイトについて",
    enTitle: "About This Site",
    description:
      "This service is a platform for communication and creative activities centered on AI-generated illustrations",
    enDescription:
      "A platform for AI-generated illustrations and creative activities, fostering communication and creativity.",
    isIndex: true,
  },
  PRESSKIT: {
    title: "プレスキット",
    enTitle: "Press Kit",
    description:
      "Aipictorsのロゴ素材をダウンロードできます。メディア掲載や紹介記事などでご活用ください。",
    enDescription:
      "Download Aipictors logo materials for media coverage, articles, and promotional purposes.",
    isIndex: true,
  },
  HELP: {
    title: "使い方ガイド",
    enTitle: "User Guide",
    description:
      "Aipictorsの使い方を詳しく説明します。初心者の方でも安心してサービスをご利用いただけるよう、機能やコミュニティガイドラインを詳しく解説しています。",
    enDescription:
      "Learn how to use Aipictors with our comprehensive guide. Detailed explanations of features and community guidelines for beginners and advanced users alike.",
    isIndex: true,
  },
  CONTACT: {
    title: "お問い合わせ",
    enTitle: "Contact",
    description: "Contact us for inquiries and feedback",
    enDescription: "Contact us for inquiries and feedback",
    isIndex: true,
  },
  TERNS: {
    title: "利用規約",
    enTitle: "Terms of Use",
    description: "Information about the Aipictors terms of use",
    enDescription: "Read the terms of use for Aipictors.",
    isIndex: true,
  },
  TAGS: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  USERS: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  PRIVACY: {
    title: "プライバシーポリシー",
    enTitle: "Privacy Policy",
    description: "Information about the Aipictors privacy policy",
    enDescription: "Read the privacy policy for Aipictors",
    isIndex: true,
  },
  APP: {
    title: "アプリ",
    enTitle: "App",
    description: "Download the Aipictors app",
    enDescription: "Download the Aipictors app",
    isIndex: true,
  },
  POSTS: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  CONTRIBUTORS: {
    title: "貢献者一覧",
    enTitle: "Contributors List",
    description: "List of contributors to Aipictors",
    enDescription: "View the list of contributors to Aipictors",
    image: "https://assets.aipictors.com/geometric_shapes.webp",
    isIndex: true,
  },
  RANKINGS_MONTHLY: {
    title: "月間ランキング",
    enTitle: "Monthly Rankings",
    description: "AI illustration monthly ranking information",
    enDescription: "View the AI illustration monthly ranking information",
    isIndex: true,
  },
  RANKINGS_WEEK: {
    title: "週間ランキング",
    enTitle: "Weekly Rankings",
    description: "AI illustration weekly ranking information",
    enDescription: "View the AI illustration weekly ranking information",
    isIndex: true,
  },
  RANKINGS_DAY: {
    title: "デイリーランキング",
    enTitle: "Daily Rankings",
    description: "AI illustration daily ranking information",
    enDescription: "View the AI illustration daily ranking information",
    isIndex: true,
  },
  RELEASE: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  SENSITIVE_RANKINGS_DAY: {
    title: "センシティブデイリーランキング",
    enTitle: "Sensitive Daily Rankings",
    description: "Sensitive AI illustration daily ranking information",
    enDescription: "View sensitive AI illustration daily ranking information",
    isIndex: true,
  },
  SENSITIVE_RANKINGS_WEEK: {
    title: "センシティブ週間ランキング",
    enTitle: "Sensitive Weekly Rankings",
    description: "Sensitive AI illustration weekly ranking information",
    enDescription: "View sensitive AI illustration weekly ranking information",
    isIndex: true,
  },
  SENSITIVE_RANKINGS_MONTHLY: {
    title: "センシティブ月間ランキング",
    enTitle: "Sensitive Monthly Rankings",
    description: "Sensitive AI illustration monthly ranking information",
    enDescription: "View sensitive AI illustration monthly ranking information",
    isIndex: true,
  },
  SENSITIVE_THEME_RANKINGS_WEEK: {
    title: "センシティブ週間お題ランキング",
    enTitle: "Sensitive Weekly Theme Rankings",
    description: "Sensitive AI illustration weekly theme ranking information",
    enDescription:
      "View sensitive AI illustration weekly theme ranking information",
    isIndex: true,
  },
  SEARCH: {
    title: "検索",
    enTitle: "Search",
    description: "You can search the latest AI illustrations",
    enDescription: "Search for the latest AI illustrations",
    isIndex: true,
  },
  MODELS: {
    title: "モデル一覧",
    enTitle: "Model List",
    description: "Check works generated from the model list",
    enDescription: "Explore works generated by various models",
    isIndex: true,
  },
  MODEL: {
    title: "{{title}}",
    enTitle: "{{enTitle}}",
    description: "{{description}}",
    enDescription: "{{enDescription}}",
    image: "{{url}}",
    isIndex: true,
  },
  LOGIN: {
    title: "ログイン",
    enTitle: "Login",
    description: "Log in and enjoy Aipictors!",
    enDescription:
      "Login to access your Aipictors account and enjoy AI illustrations",
    isIndex: true,
  },
  GENERATION: {
    title: "生成",
    enTitle: "Generation",
    description: "Generate AI illustrations",
    enDescription: "Generate AI illustrations",
    isIndex: true,
  },
  GENERATION_ABOUT: {
    title: "生成機能について",
    enTitle: "About Generation Feature",
    description: "Generate anything from illustrations to realistic images!",
    enDescription:
      "Explore Aipictors' generation feature, from illustrations to realistic imagery!",
    image: "{{url}}",
    isIndex: true,
  },
  GENERATION_PLANS: {
    title: "生成機能のプラン",
    enTitle: "Generation Plans",
    description: "Introducing the plans for the generation feature",
    enDescription:
      "Discover the available plans for Aipictors' generation feature",
    isIndex: true,
  },
  TERMS: {
    title: "利用規約",
    enTitle: "Terms of Use",
    description: "Explanation of the terms of use for Aipictors",
    enDescription: "Read the terms of use for Aipictors",
    isIndex: true,
  },
  GENERATION_TERMS: {
    title: "生成機能の利用規約",
    enTitle: "Generation Terms of Use",
    description: "Explanation of the terms of use for the generation feature",
    enDescription: "Read the terms of use for Aipictors' generation feature",
    isIndex: true,
  },
  SPECIFIED_COMMERCIAL_TRANSACTION: {
    title: "特定商取引法に基づく表示",
    enTitle: "Specified Commercial Transaction Law",
    description:
      "Information based on the Specified Commercial Transaction Law",
    enDescription:
      "View information based on the Specified Commercial Transaction Law",
    isIndex: true,
  },
  STICKERS: {
    title: "スタンプ",
    enTitle: "Stickers",
    description: "Check out the latest stickers on Aipictors",
    enDescription: "View the latest stickers available on Aipictors",
    isIndex: true,
  },
  SUPPORT_CHAT: {
    title: "お問い合わせ",
    enTitle: "Support Chat",
    description:
      "You can receive support through chat with the management team",
    enDescription:
      "Contact support through the chat feature with the Aipictors team",
    isIndex: false,
  },
  PLUS: {
    title: "サブスクリプション",
    enTitle: "Subscription",
    description: "Manage and update your subscription",
    enDescription: "Manage and view your Aipictors subscription details",
    isIndex: false,
  },
  NEW_IMAGE: {
    title: "画像投稿",
    enTitle: "New Image",
    description: "You can post images",
    enDescription: "Post new images on Aipictors",
    isIndex: false,
  },
  NEW_ANIMATION: {
    title: "動画投稿",
    enTitle: "New Video",
    description: "You can post videos",
    enDescription: "Post new videos on Aipictors",
    isIndex: false,
  },
  NEW_TEXT: {
    title: "小説・コラム投稿",
    enTitle: "New Text",
    description: "You can post novels and columns",
    enDescription: "Post new novels and columns on Aipictors",
    isIndex: false,
  },
  NOTIFICATIONS: {
    title: "通知履歴",
    enTitle: "Notification History",
    description: "You can check your notification history",
    enDescription: "View your notification history on Aipictors",
    isIndex: false,
  },
  CREATOR: {
    title: "支援リクエスト",
    enTitle: "Support Requests",
    description: "You can check your support requests",
    enDescription: "View and manage your support requests",
    isIndex: false,
  },
  NEW_PROFILE: {
    title: "プロフィール作成",
    enTitle: "Create Profile",
    description: "You can create your profile",
    enDescription: "Create your profile on Aipictors",
    isIndex: false,
  },
  NEW_SETTINGS: {
    title: "ユーザ設定作成",
    enTitle: "Create User Settings",
    description: "You can create your user settings",
    enDescription: "Create and manage your user settings",
    isIndex: false,
  },
  COMPLETED_SETTINGS: {
    title: "設定完了！",
    enTitle: "Settings Completed!",
    description: "This page is displayed when the settings are completed",
    enDescription: "You have successfully completed the settings!",
    isIndex: false,
  },
  SETTINGS_ACCOUNT: {
    title: "アカウント設定",
    enTitle: "Account Settings",
    description: "You can configure your account settings",
    enDescription: "Manage your account settings",
    isIndex: false,
  },
  SETTINGS_NOTIFICATION: {
    title: "通知・いいね設定",
    enTitle: "Notification & Like Settings",
    description: "You can configure your notification and like settings",
    enDescription: "Manage your notification and like preferences",
    isIndex: false,
  },
  SETTINGS_ACCOUNT_PASSWORD: {
    title: "パスワード設定",
    enTitle: "Password Settings",
    description: "You can configure your password settings",
    enDescription: "Manage your password settings",
    isIndex: false,
  },
  SETTINGS_MUTE_USERS: {
    title: "ユーザミュート設定",
    enTitle: "Mute Users Settings",
    description: "You can configure your user mute settings",
    enDescription: "Manage your user mute preferences",
    isIndex: false,
  },
  SETTINGS_BLOCK_USERS: {
    title: "ユーザブロック設定",
    enTitle: "Block Users Settings",
    description: "You can configure your user block settings",
    enDescription: "Manage your user block preferences",
    isIndex: false,
  },
  SETTINGS_COLOR: {
    title: "カラー設定",
    enTitle: "Color Settings",
    description: "You can configure your color settings",
    enDescription: "Manage your color preferences",
    isIndex: false,
  },
  SETTINGS_SUPPORT: {
    title: "サポート設定",
    enTitle: "Support Settings",
    description: "You can configure your support settings",
    enDescription: "Manage your support settings",
    isIndex: false,
  },
  SETTINGS_STICKERS: {
    title: "スタンプ設定",
    enTitle: "Sticker Settings",
    description: "You can configure your sticker settings",
    enDescription: "Manage your sticker preferences",
    isIndex: false,
  },
  SETTINGS_MUTE_TAGS: {
    title: "タグミュート設定",
    enTitle: "Mute Tags Settings",
    description: "You can configure your tag mute settings",
    enDescription: "Manage your tag mute preferences",
    isIndex: false,
  },
  SETTINGS_FOLLOWED_TAGS: {
    title: "フォローしているタグ設定",
    enTitle: "Followed Tags Settings",
    description: "You can configure your followed tag settings",
    enDescription: "Manage your followed tag preferences",
    isIndex: false,
  },
  SETTINGS_LOGIN: {
    title: "ログイン設定",
    enTitle: "Login Settings",
    description: "You can configure your login settings",
    enDescription: "Manage your login preferences",
    isIndex: false,
  },
  SETTINGS_RESTRICTION: {
    title: "表示コンテンツ設定",
    enTitle: "Content Display Settings",
    description: "You can configure your content display settings",
    enDescription: "Manage your content display preferences",
    isIndex: false,
  },
  SETTINGS_PROFILE: {
    title: "プロフィール設定",
    enTitle: "Profile Settings",
    description: "You can configure your profile settings",
    enDescription: "Manage your profile settings",
    isIndex: false,
  },
  SETTINGS_ADVERTISEMENTS: {
    title: "広告設定",
    enTitle: "Advertisement Settings",
    description: "You can configure your advertisement settings",
    enDescription: "Manage your advertisement settings",
    isIndex: false,
  },
  FOLLOWERS: {
    title: "フォロワー",
    enTitle: "Followers",
    description: "List of followers",
    enDescription: "View and manage your followers",
    isIndex: false,
  },
  FOLLOWINGS: {
    title: "フォロー中",
    enTitle: "Followings",
    description: "List of followings",
    enDescription: "View and manage your followings",
    isIndex: false,
  },
  MY: {
    title: "ダッシュボード",
    enTitle: "Dashboard",
    description: "You can manage your account information",
    enDescription: "Manage your account information on Aipictors",
    isIndex: false,
  },
  MY_BOOKMARKS: {
    title: "ブックマーク",
    enTitle: "Bookmarks",
    description: "List of your bookmarked works",
    enDescription: "View and manage your bookmarked works",
    isIndex: false,
  },
  MY_ALBUMS: {
    title: "シリーズ一覧",
    enTitle: "Series List",
    description: "You can manage your series",
    enDescription: "Manage your series on Aipictors",
    isIndex: false,
  },
  MY_FOLDERS: {
    title: "コレクション一覧",
    enTitle: "Collection List",
    description: "You can manage your collections",
    enDescription: "Manage your collections on Aipictors",
    isIndex: false,
  },
  MY_LIKES: {
    title: "いいね",
    enTitle: "Likes",
    description: "List of your liked works",
    enDescription: "View and manage your liked works",
    isIndex: false,
  },
  MY_VIEWS: {
    title: "閲覧履歴",
    enTitle: "View History",
    description: "List of your viewed works",
    enDescription: "View and manage your viewed works",
    isIndex: false,
  },
  MY_REPORTS: {
    title: "お知らせ一覧",
    enTitle: "Report History",
    description: "List of your reported works",
    enDescription: "View and manage your reported works",
    isIndex: false,
  },
  MY_POSTS: {
    title: "作品一覧",
    enTitle: "Posts List",
    description: "You can manage your works",
    enDescription: "Manage your posted works on Aipictors",
    isIndex: false,
  },
  MY_RECOMMENDED: {
    title: "推薦作品一覧",
    enTitle: "Recommended Works List",
    description: "You can manage your recommended works",
    enDescription: "View and manage your recommended works",
    isIndex: false,
  },
  GENERATION_DEMO: {
    title: "生成",
    enTitle: "Generation",
    description: "Generate AI illustrations",
    enDescription: "Generate AI illustrations",
    isIndex: false,
  },
}
