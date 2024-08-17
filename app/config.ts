import { env } from "~/env"

/**
 * 設定
 */
export const config = {
  cacheControl: {
    get home() {
      return "max-age=0, s-maxage=240, stale-while-revalidate=2592000, stale-if-error=2592000"
    },
    get short() {
      return "max-age=0, s-maxage=60, stale-while-revalidate=2592000, stale-if-error=2592000"
    },
    get oneHour() {
      return "max-age=0, s-maxage=3600, stale-while-revalidate=2592000, stale-if-error=2592000"
    },
    get oneDay() {
      return "max-age=0, s-maxage=86400, stale-while-revalidate=2592000, stale-if-error=2592000"
    },
  },
  fcm: {
    get vapidKey() {
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
    defaultVaeValue: "kl-f8-anime2",
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
          : import.meta.env.VITE_MICRO_CMS_API_KEY,
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
    get endpoint() {
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
      award: 16,
      tag: 12,
    },
  },
  /**
   * ワードプレスエンドポイント
   */
  wordpressEndpoint: {
    siteURL: "https://www.aipictors.com",
    privateImage:
      "https://www.aipictors.com/wp-content/themes/AISite/private-image-direct.php",
    www4: "https://www4.aipictors.com/index.php",
    uploadPrivateImage:
      "https://www.aipictors.com/wp-content/themes/AISite/upload-private-image.php",
    deleteUploadedImage:
      "https://www.aipictors.com/wp-content/themes/AISite/delete-public-image.php",
    generationCheck:
      "https://www.aipictors.com/wp-content/themes/AISite/generation-check.php",
    getRecommendedWorkIdsByWorkId:
      "https://www.aipictors.com/wp-content/themes/AISite/cooperative-ids.php",
    getRecommendedIds:
      "https://www.aipictors.com/wp-content/themes/AISite/recommended-ids.php",
  },
  uploader: {
    uploadImage: env.VITE_WORKERS_UPLOADER,
  },
  /**
   * ワードプレスリンク
   */
  wordpressLink: {
    logout: "https://www.aipictors.com/logout",
    top: "https://www.aipictors.com",
  },
  /**
   * 汎用APIエンドポイント
   */
  internalApiEndpoint: {
    promptsCheck: "https://internal.api.aipictors.com/prompts/check/index.php",
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
  description?: string
  enDescription?: string
  image?: string | null
  isIndex?: boolean
  isTop?: boolean
}

/**
 * メタ情報の設定
 */
export const META: { [key: string]: MetaData } = {
  /**
   * インデックスあり
   */
  HOME: {
    title: "ホーム",
    description:
      "AI画像投稿サイト・生成サイト「Aipictors」で作品を公開してみよう!最新のAIイラストを楽しむことができます、グラビアからイラストまでジャンルは様々！無料でイラスト生成することもできます！",
    isIndex: true,
  },
  HOME_2D: {
    title: "イラスト一覧",
    description: `${new Date().getFullYear()}年の最新のAIイラスト一覧です！様々なモデルで作成された人気作品をチェックしよう！`,
    isIndex: true,
  },
  HOME_3D: {
    title: "フォト一覧",
    description: `${new Date().getFullYear()}年の最新の3D、フォト画像一覧です！様々なモデルで作成された人気作品をチェックしよう！`,
    isIndex: true,
  },
  HOME_SENSITIVE: {
    title: "センシティブ一覧",
    description: `${new Date().getFullYear()}年の最新のセンシティブ画像一覧です！様々なモデルで作成された人気作品をチェックしよう！`,
    isIndex: true,
  },
  RELEASES: {
    title: "リリース情報",
    description: "最新のAipictorsのリリース情報をチェックできます",
    isIndex: true,
  },
  MILESTONES: {
    title: "開発予定",
    description: "最新のAipictorsの開発予定情報をチェックできます",
    isIndex: true,
  },
  EVENTS: {
    title: "イベント一覧",
    description: `${new Date().getFullYear()}年の最新のAIイラストイベント情報をチェックできます`,
    isIndex: true,
  },
  EVENTS_INDEX: {
    title: "{{title}}",
    description: "{{description}}",
    image: "{{url}}",
    isIndex: true,
  },
  RANKINGS: {
    title: "ランキング",
    description: "Aipictorsのランキング情報をチェックできます",
    isIndex: true,
  },
  THEMES: {
    title: "お題",
    description:
      "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。",
    isIndex: true,
  },
  ABOUT: {
    title: "このサイトについて",
    description:
      "当サービスはAIで生成されたイラストのコンテンツをテーマにコミュニケーション、創作活動するプラットフォームです",
    isIndex: true,
  },
  TERNS: {
    title: "利用規約",
    description: "Aipictorsの利用規約についての情報です",
    isIndex: true,
  },
  USERS: {
    title: "{{title}}",
    description: "{{description}}",
    image: "{{url}}",
    isIndex: true,
  },
  POSTS: {
    title: "{{title}}",
    description: "{{description}}",
    image: "{{url}}",
    isIndex: true,
  },
  CONTRIBUTORS: {
    title: "貢献者一覧",
    description: "Aipictorsの貢献者一覧です",
    image: "https://assets.aipictors.com/geometric_shapes.webp",
    isIndex: true,
  },
  RANKINGS_MONTHLY: {
    title: "月間ランキング",
    description: "AIイラスト月間ランキングの情報です",
    isIndex: true,
  },
  RANKINGS_WEEK: {
    title: "週間ランキング",
    description: "AIイラスト週間ランキングの情報です",
    isIndex: true,
  },
  RANKINGS_DAY: {
    title: "デイリーランキング",
    description: "AIイラストのデイリーランキングの情報です",
    isIndex: true,
  },
  SENSITIVE_RANKINGS_DAY: {
    title: "センシティブデイリーランキング",
    description: "センシティブなAIイラストのデイリーランキングの情報です",
    isIndex: true,
  },
  SENSITIVE_RANKINGS_WEEK: {
    title: "センシティブ週間ランキング",
    description: "センシティブなAIイラスト週間ランキングの情報です",
    isIndex: true,
  },
  SENSITIVE_RANKINGS_MONTHLY: {
    title: "センシティブ月間ランキング",
    description: "センシティブなAIイラスト月間ランキングの情報です",
    isIndex: true,
  },
  SENSITIVE_THEME_RANKINGS_WEEK: {
    title: "センシティブ週間お題ランキング",
    description: "センシティブなAIイラスト週間お題ランキングの情報です",
    isIndex: true,
  },
  SEARCH: {
    title: "検索",
    description: "最新のAIイラストを検索することができます",
    isIndex: true,
  },
  /**
   * インデックスなし
   */
  SUPPORT_CHAT: {
    title: "お問い合わせ",
    description: "運営とのチャットでサポートを受けることができます",
    isIndex: false,
  },
  PLUS: {
    title: "サブスクリプション",
    description: "サブスクリプションを管理、更新することができます",
    isIndex: false,
  },
  NEW_IMAGE: {
    title: "画像投稿",
    description: "画像を投稿することができます",
    isIndex: false,
  },
  NEW_ANIMATION: {
    title: "動画投稿",
    description: "動画を投稿することができます",
    isIndex: false,
  },
  NEW_TEXT: {
    title: "小説・コラム投稿",
    description: "小説・コラムを投稿することができます",
    isIndex: false,
  },
  NOTIFICATIONS: {
    title: "通知履歴",
    description: "通知を確認することができます",
    isIndex: false,
  },
  /**
   * 設定
   */
  SETTINGS_ACCOUNT: {
    title: "アカウント設定",
    description: "アカウントに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_NOTIFICATION: {
    title: "通知・いいね設定",
    description: "通知・いいねに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_ACCOUNT_PASSWORD: {
    title: "パスワード設定",
    description: "パスワードに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_MUTE_USERS: {
    title: "ユーザミュート設定",
    description: "ユーザミュートに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_COLOR: {
    title: "カラー設定",
    description: "カラーに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_SUPPORT: {
    title: "サポート設定",
    description: "サポートに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_STICKERS: {
    title: "スタンプ設定",
    description: "スタンプに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_MUTE_TAGS: {
    title: "タグミュート設定",
    description: "タグミュートに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_LOGIN: {
    title: "ログイン設定",
    description: "ログインに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_RESTRICTION: {
    title: "表示コンテンツ設定",
    description: "表示コンテンツに関する設定を行うことができます",
    isIndex: false,
  },
  SETTINGS_PROFILE: {
    title: "プロフィール設定",
    description: "プロフィールに関する設定を行うことができます",
    isIndex: false,
  },
  /**
   * ダッシュボード
   */
  MY_BOOKMARKS: {
    title: "ブックマーク",
    description: "自身のブックマークした作品一覧です。",
    isIndex: false,
  },
  MY_ALBUMS: {
    title: "シリーズ一覧",
    description: "自身のシリーズを管理することができます",
    isIndex: false,
  },
  MY_POSTS: {
    title: "作品一覧",
    description: "自身の作品を管理することができます",
    isIndex: false,
  },
  MY_RECOMMENDED: {
    title: "推薦作品一覧",
    description: "自身の推薦した作品を管理することができます",
    isIndex: false,
  },

  // 他のページも同様に追加
}
