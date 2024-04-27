import { env } from "@/env"

/**
 * 設定
 */
export const config = {
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
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
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
      if (typeof window === "undefined") {
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
  },
  /**
   * ワードプレスエンドポイント
   */
  wordpressEndpoint: {
    siteURL: "https://www.aipictors.com",
    privateImage:
      "https://www.aipictors.com/wp-content/themes/AISite/private-image.php",
    www4: "https://www4.aipictors.com/index.php",
    uploadPrivateImage:
      "https://www.aipictors.com/wp-content/themes/AISite/upload-private-image.php",
    uploadPublicImage:
      "https://www.aipictors.com/wp-content/themes/AISite/upload-public-image.php",
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
   * 本番環境である
   */
  isReleaseMode: import.meta.env.MODE !== "development",
}
