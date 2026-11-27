/**
 * 解約・退会の理由のアンケート（主な理由 + 理由ごとの追加質問 + 詳しい説明。追加質問と詳しい説明はどの理由でも必須）
 * - 保存は aipictors-api（解約: subscription_cancel_reasons.details、退会: account_leave_reasons）。形は lib/leave-survey.ts の sanitizeLeaveDetails
 * - アプリ（aipictors/app の lib/v2/settings/leave_survey.dart）も同じ値を使う。値（value）は集計に使うので変えない。文言は変えてよい
 * - 理由を分けるときは新しい値を作り、古い値は LEGACY_QUALITY_REASON のように集計の表示用に残す（品質と不具合は 11/27 に quality → image_quality / bugs に分けた）
 */

type Text = readonly [ja: string, en: string]

export type LeaveSurveyOption = { value: string; label: Text }

export type LeaveSurveyGroup = {
  id: string
  question: Text
  options: LeaveSurveyOption[]
  /** ほかの質問でこの選択肢を選んだときだけ出す */
  showIf?: { group: string; value: string }
}

export type LeaveSurveyReason = {
  value: string
  label: Text
  groups: LeaveSurveyGroup[]
  /** 理由の詳しい説明の欄（required なら minLength 文字以上で送れる） */
  text?: { label: Text; placeholder: Text; required?: boolean }
}

export type LeaveSurveyKind = "subscription" | "account"

export type LeaveSurveyAnswer = {
  reason: string | null
  choices: Record<string, string[]>
  text: string
  improvement: string
}

/** 理由の詳しい説明（必須）の最低文字数 */
export const LEAVE_SURVEY_MIN_TEXT = 10

export const emptyLeaveSurveyAnswer = (): LeaveSurveyAnswer => ({
  reason: null,
  choices: {},
  text: "",
  improvement: "",
})

/** 機能の選択肢（品質・不具合の「どの機能で」） */
const FEATURE_OPTIONS: LeaveSurveyOption[] = [
  { value: "txt2img", label: ["ふつうの生成", "Regular generation"] },
  { value: "img2img", label: ["画像から生成（i2i）", "Image to image"] },
  { value: "inpaint", label: ["部分修正（インペイント）", "Inpainting"] },
  {
    value: "upscale",
    label: ["高画質化・高解像度", "Upscale / high resolution"],
  },
  {
    value: "controlnet",
    label: ["ポーズ指定（ControlNet）", "Pose control (ControlNet)"],
  },
  { value: "lora", label: ["LoRA・みんなのモデル", "LoRA / community models"] },
  {
    value: "special_model",
    label: [
      "Flux・Gemini などの特別なモデル",
      "Special models (Flux, Gemini, etc.)",
    ],
  },
  { value: "mosaic", label: ["自動モザイク", "Auto mosaic"] },
  { value: "post", label: ["投稿・作品ページ", "Posting / work pages"] },
]

/** 絵の仕上がり（品質）。不具合（BUG_GROUPS）とは別に聞く */
const IMAGE_QUALITY_GROUPS: LeaveSurveyGroup[] = [
  {
    id: "problem",
    question: ["どんなところが気になりましたか？", "What bothered you?"],
    options: [
      {
        value: "face_hand",
        label: ["顔・手・体が崩れる", "Faces, hands or bodies look broken"],
      },
      {
        value: "style",
        label: ["画風・絵柄が好みと違う", "The art style isn't what I like"],
      },
      {
        value: "prompt",
        label: ["プロンプト通りにならない", "Results didn't follow my prompt"],
      },
      {
        value: "low_res",
        label: ["画質が粗い・ぼやける", "Images look rough or blurry"],
      },
      {
        value: "same",
        label: ["似た絵ばかり出る", "Results all look the same"],
      },
      {
        value: "worse_than",
        label: ["ほかのサービスより見劣りする", "Worse than other services"],
      },
      {
        value: "no_model",
        label: [
          "欲しいモデル・LoRA がない",
          "The model or LoRA I wanted isn't there",
        ],
      },
    ],
  },
  {
    id: "genre",
    question: [
      "どんな絵を作りたかったですか？",
      "What kind of images did you want?",
    ],
    options: [
      { value: "anime", label: ["アニメ・イラスト調", "Anime / illustration"] },
      { value: "real", label: ["リアル・写真風", "Realistic / photo"] },
      {
        value: "character",
        label: ["特定のキャラクター", "A specific character"],
      },
      { value: "scenery", label: ["背景・風景", "Backgrounds / scenery"] },
      { value: "r18", label: ["R-18", "R-18"] },
      { value: "other_genre", label: ["その他", "Other"] },
    ],
  },
  {
    id: "feature",
    question: [
      "どの機能・モデルで気になりましたか？",
      "With which feature or model?",
    ],
    options: [
      ...FEATURE_OPTIONS.filter((option) => option.value !== "post"),
      {
        value: "unknown",
        label: ["分からない・全体的に", "Not sure / overall"],
      },
    ],
  },
]

/** 不具合（エラー・動かない）。どこで・どの端末で・どれくらいの頻度かまで聞く */
const BUG_GROUPS: LeaveSurveyGroup[] = [
  {
    id: "symptom",
    question: ["どんな不具合でしたか？", "What went wrong?"],
    options: [
      {
        value: "gen_error",
        label: ["エラーで生成が失敗する", "Generations fail with an error"],
      },
      {
        value: "stuck",
        label: [
          "生成が終わらない・途中で止まる",
          "Generations never finish or get stuck",
        ],
      },
      {
        value: "coin_lost",
        label: [
          "コインが減ったのに画像が出ない",
          "Coins were spent but no image appeared",
        ],
      },
      {
        value: "no_image",
        label: [
          "画像が表示されない・保存できない",
          "Images don't show or can't be saved",
        ],
      },
      {
        value: "ui_broken",
        label: [
          "画面が崩れる・ボタンが反応しない",
          "The page breaks or buttons don't respond",
        ],
      },
      {
        value: "app_crash",
        label: ["アプリが落ちる・固まる", "The app crashes or freezes"],
      },
      {
        value: "login_pay",
        label: [
          "ログイン・支払いがうまくいかない",
          "Problems with login or payment",
        ],
      },
      {
        value: "post_fail",
        label: ["投稿・編集ができない", "Can't post or edit works"],
      },
    ],
  },
  {
    id: "feature",
    question: ["どの機能で起きましたか？", "Which feature?"],
    options: [
      ...FEATURE_OPTIONS,
      { value: "payment", label: ["支払い・プラン", "Payment / plans"] },
      { value: "other_feature", label: ["その他", "Other"] },
    ],
  },
  {
    id: "device",
    question: ["どの端末で使っていましたか？", "Which device?"],
    options: [
      {
        value: "pc_browser",
        label: ["パソコンのブラウザ", "Computer browser"],
      },
      {
        value: "phone_browser",
        label: ["スマホのブラウザ", "Phone browser"],
      },
      { value: "ios_app", label: ["iPhone アプリ", "iPhone app"] },
      { value: "android_app", label: ["Android アプリ", "Android app"] },
    ],
  },
  {
    id: "frequency",
    question: ["どれくらい起きましたか？", "How often did it happen?"],
    options: [
      { value: "every_time", label: ["毎回", "Every time"] },
      { value: "often", label: ["よく起きる", "Often"] },
      { value: "sometimes", label: ["ときどき", "Sometimes"] },
      { value: "once", label: ["1〜2回だけ", "Once or twice"] },
    ],
  },
]

const IMAGE_QUALITY_REASON: LeaveSurveyReason = {
  value: "image_quality",
  label: [
    "生成した絵の品質が合わなかった",
    "The generated images weren't good enough",
  ],
  groups: IMAGE_QUALITY_GROUPS,
  text: {
    label: [
      "作りたかった絵と、実際の仕上がりの違いを教えてください",
      "How did the results differ from what you wanted?",
    ],
    placeholder: [
      "例: アニメ調の全身絵で、指が6本になることが多い",
      "e.g. Full-body anime images often had six fingers",
    ],
    required: true,
  },
}

const BUG_REASON: LeaveSurveyReason = {
  value: "bugs",
  label: ["不具合・エラーで使えなかった", "Bugs or errors got in the way"],
  groups: BUG_GROUPS,
  text: {
    label: [
      "どの画面で何をしたら、どうなりましたか（エラーの文があれば）",
      "What did you do, and what happened? (include any error message)",
    ],
    placeholder: [
      "例: スマホで高画質化を押すと「生成に失敗しました」と出て、コインだけ減った",
      'e.g. On my phone, upscaling showed "Generation failed" and still used coins',
    ],
    required: true,
  },
}

/** 11/27 までの「生成の品質・不具合が気になった」（品質と不具合を分ける前）。集計の表示だけに使う */
const LEGACY_QUALITY_REASON: LeaveSurveyReason = {
  value: "quality",
  label: [
    "品質・不具合（分ける前の回答）",
    "Quality problems or bugs (old answers)",
  ],
  groups: [
    {
      id: "problem",
      question: ["どんなところが気になりましたか？", "What bothered you?"],
      options: [
        { value: "face_hand", label: ["顔や手が崩れる", "Faces or hands"] },
        { value: "errors", label: ["エラーで失敗した", "Errors"] },
        { value: "style", label: ["画風が合わない", "Art style"] },
        { value: "prompt", label: ["プロンプト通りにならない", "Prompt"] },
        { value: "wait", label: ["待ち時間が長い", "Long waits"] },
        { value: "feature", label: ["特定の機能がうまく動かない", "Feature"] },
      ],
    },
    {
      id: "feature",
      question: ["どの機能ですか？", "Which feature?"],
      options: [
        ...FEATURE_OPTIONS,
        { value: "other_feature", label: ["その他", "Other"] },
      ],
    },
  ],
}

const SERVICE_GROUPS: LeaveSurveyGroup[] = [
  {
    id: "dest",
    question: ["どこに移りますか？", "Where are you moving to?"],
    options: [
      { value: "novelai", label: ["NovelAI", "NovelAI"] },
      { value: "nijijourney", label: ["にじジャーニー", "niji・journey"] },
      { value: "midjourney", label: ["Midjourney", "Midjourney"] },
      {
        value: "local",
        label: [
          "自分の PC（WebUI・ComfyUI など）",
          "My own PC (WebUI, ComfyUI, etc.)",
        ],
      },
      { value: "pixai", label: ["PixAI", "PixAI"] },
      { value: "tensor", label: ["Tensor.Art", "Tensor.Art"] },
      { value: "seaart", label: ["SeaArt", "SeaArt"] },
      {
        value: "chatgpt",
        label: ["ChatGPT・Gemini などの画像生成", "ChatGPT, Gemini, etc."],
      },
      { value: "other_dest", label: ["その他", "Other"] },
    ],
  },
  {
    id: "why",
    question: ["そちらのどこが良かったですか？", "What does it do better?"],
    options: [
      { value: "quality_better", label: ["絵の品質", "Image quality"] },
      { value: "cheaper", label: ["料金が安い", "Cheaper"] },
      {
        value: "models",
        label: ["モデル・LoRA が多い", "More models / LoRAs"],
      },
      { value: "freedom", label: ["制限が少ない", "Fewer restrictions"] },
      { value: "speed", label: ["速い", "Faster"] },
      {
        value: "community",
        label: ["投稿・交流の場がある", "Better community / posting"],
      },
      {
        value: "friends",
        label: ["知り合いが使っている", "My friends use it"],
      },
    ],
  },
]

const SERVICE_TEXT: LeaveSurveyReason["text"] = {
  label: [
    "移る先のサービス名と、そちらを選んだ理由を教えてください",
    "Which service, and why did you choose it?",
  ],
  placeholder: [
    "例: ○○。同じ値段で新しいモデルが使える",
    "e.g. ... — it has newer models for the same price",
  ],
  required: true,
}

/** 理由の詳しい説明（すべての理由で必須） */
const detailText = (
  label: Text,
  placeholder: Text,
): LeaveSurveyReason["text"] => ({ label, placeholder, required: true })

const PRICE_OK_GROUP: LeaveSurveyGroup = {
  id: "price_ok",
  question: [
    "月いくらなら続けたいですか？",
    "What monthly price would keep you?",
  ],
  options: [
    { value: "jpy300", label: ["300円くらい", "About ¥300"] },
    { value: "jpy500", label: ["500円くらい", "About ¥500"] },
    { value: "jpy1000", label: ["1,000円くらい", "About ¥1,000"] },
    { value: "jpy2000", label: ["2,000円くらい", "About ¥2,000"] },
    {
      value: "not_price",
      label: ["値段の問題ではない", "It's not about the price"],
    },
  ],
}

/** サブスクの解約（値は aipictors-api の CANCEL_REASONS） */
export const SUBSCRIPTION_LEAVE_REASONS: LeaveSurveyReason[] = [
  {
    value: "not_using",
    label: ["あまり使わなかった", "I didn't use it much"],
    text: detailText(
      [
        "使わなくなった理由を具体的に教えてください",
        "Tell us more about why you didn't use it",
      ],
      [
        "例: 仕事が忙しく、週末に少し触っただけだった",
        "e.g. Work got busy and I only tried it on weekends",
      ],
    ),
    groups: [
      {
        id: "why",
        question: ["あてはまるものを選んでください", "Which of these apply?"],
        options: [
          { value: "no_time", label: ["時間がなかった", "I didn't have time"] },
          {
            value: "how_to",
            label: ["使い方が分からなかった", "I didn't know how to use it"],
          },
          {
            value: "not_as_expected",
            label: [
              "思った絵が出なかった",
              "I couldn't get the images I wanted",
            ],
          },
          {
            value: "no_model",
            label: [
              "欲しいモデル・画風がなかった",
              "The model or style I wanted wasn't there",
            ],
          },
          {
            value: "for_posting",
            label: [
              "投稿・閲覧が目的だった",
              "I mainly came to post or browse",
            ],
          },
          {
            value: "forgot",
            label: ["加入していたのを忘れていた", "I forgot I was subscribed"],
          },
        ],
      },
    ],
  },
  {
    value: "coins",
    label: ["コインが足りなかった", "I ran out of coins"],
    text: detailText(
      [
        "どの機能を、どれくらい使うと足りなくなりましたか",
        "Which features, and how much, before you ran out?",
      ],
      [
        "例: 高画質化を1日20回ほど使うと昼にはなくなる",
        "e.g. About 20 upscales a day and I'm out by noon",
      ],
    ),
    groups: [
      {
        id: "why",
        question: [
          "どんなときに足りませんでしたか？",
          "When did you run short?",
        ],
        options: [
          {
            value: "daily_short",
            label: [
              "毎日のコインがすぐなくなる",
              "Daily coins run out quickly",
            ],
          },
          {
            value: "hires_cost",
            label: [
              "高画質化・高解像度のコインが重い",
              "Upscale / high resolution costs too much",
            ],
          },
          {
            value: "special_model_cost",
            label: [
              "Flux・Gemini などのコインが重い",
              "Special models (Flux, Gemini) cost too much",
            ],
          },
          {
            value: "buy_expensive",
            label: [
              "コインを買い足すのが高い",
              "Buying extra coins is expensive",
            ],
          },
        ],
      },
      PRICE_OK_GROUP,
    ],
  },
  {
    value: "price",
    label: ["料金が高い", "It's too expensive"],
    text: detailText(
      [
        "具体的に教えてください（比べたサービスや、続けられる金額など）",
        "Tell us more (services you compared, a price you'd pay, etc.)",
      ],
      [
        "例: 他社は同じ値段で生成し放題。月500円なら続けたい",
        "e.g. Others offer unlimited generation for the same price",
      ],
    ),
    groups: [
      {
        id: "why",
        question: ["あてはまるものを選んでください", "Which of these apply?"],
        options: [
          {
            value: "budget",
            label: ["今は出費を減らしたい", "I need to cut spending for now"],
          },
          {
            value: "value",
            label: ["内容に対して高い", "Not worth the price"],
          },
          {
            value: "compare",
            label: [
              "ほかのサービスより高い",
              "More expensive than other services",
            ],
          },
          {
            value: "discount",
            label: [
              "年払い・割引があれば続けた",
              "I'd stay with a yearly plan or discount",
            ],
          },
        ],
      },
      PRICE_OK_GROUP,
    ],
  },
  IMAGE_QUALITY_REASON,
  BUG_REASON,
  {
    value: "slow",
    label: [
      "生成が遅い・待ち時間が長い",
      "Generation is slow or the wait is long",
    ],
    text: detailText(
      [
        "いつ・どのモデルで・どれくらい待ちましたか",
        "When, with which model, and how long did you wait?",
      ],
      [
        "例: 夜21時ごろ、SDXL で1枚に5分以上かかった",
        "e.g. Around 9pm, over 5 minutes per image with SDXL",
      ],
    ),
    groups: [
      {
        id: "when",
        question: [
          "どんなときに遅いと感じましたか？",
          "When did it feel slow?",
        ],
        options: [
          { value: "always", label: ["いつも", "Always"] },
          {
            value: "peak",
            label: ["夜など混む時間", "Busy hours such as evenings"],
          },
          {
            value: "hires",
            label: [
              "高解像度・特定のモデルのとき",
              "High resolution or specific models",
            ],
          },
          {
            value: "queue",
            label: ["順番待ちが長い", "Long queue before starting"],
          },
        ],
      },
      {
        id: "acceptable",
        question: [
          "1 回の生成で待てるのはどれくらいですか？",
          "How long can you wait per generation?",
        ],
        options: [
          { value: "wait_30s", label: ["30秒くらい", "About 30 seconds"] },
          { value: "wait_1m", label: ["1分くらい", "About 1 minute"] },
          { value: "wait_3m", label: ["3分くらい", "About 3 minutes"] },
        ],
      },
    ],
  },
  {
    value: "one_month",
    label: [
      "1か月だけ使うつもりだった",
      "I only planned to use it for a month",
    ],
    text: detailText(
      [
        "この1か月で何を作りましたか・また使うとしたらどんなときですか",
        "What did you make this month, and when would you come back?",
      ],
      [
        "例: イベント用に10枚作った。新しいモデルが来たらまた入りたい",
        "e.g. Made 10 images for an event; I'd come back for new models",
      ],
    ),
    groups: [
      {
        id: "purpose",
        question: ["何のために使いましたか？", "What did you use it for?"],
        options: [
          { value: "trial", label: ["お試し", "Just trying it"] },
          {
            value: "event",
            label: [
              "イベント・企画に参加するため",
              "To join an event or contest",
            ],
          },
          {
            value: "project",
            label: [
              "作品・同人誌などの制作のため",
              "For a project (artwork, doujinshi, etc.)",
            ],
          },
          {
            value: "specific_model",
            label: [
              "特定のモデル・機能を使うため",
              "To use a specific model or feature",
            ],
          },
          {
            value: "bonus",
            label: ["コイン・特典のため", "For coins or perks"],
          },
        ],
      },
      {
        id: "comeback",
        question: [
          "また使うとしたら、何があればいいですか？",
          "What would bring you back?",
        ],
        options: [
          {
            value: "new_models",
            label: ["新しいモデルが増えたら", "New models"],
          },
          {
            value: "campaign",
            label: ["割引・キャンペーン", "Discounts or campaigns"],
          },
          { value: "event", label: ["次のイベント", "The next event"] },
          {
            value: "feature",
            label: ["欲しい機能が増えたら", "Features I want"],
          },
          {
            value: "short_plan",
            label: ["数日だけのプラン", "A plan for just a few days"],
          },
          {
            value: "no_plan",
            label: ["今のところ予定はない", "No plans for now"],
          },
        ],
      },
    ],
  },
  {
    value: "other_service",
    label: ["ほかのサービスに移る", "I'm moving to another service"],
    groups: SERVICE_GROUPS,
    text: SERVICE_TEXT,
  },
  {
    value: "other",
    label: ["その他", "Something else"],
    groups: [],
    text: {
      label: ["理由を教えてください", "Please tell us why"],
      placeholder: [
        "例: しばらく忙しくなるため",
        "e.g. I'll be busy for a while",
      ],
      required: true,
    },
  },
]

/** アカウントの退会・一時停止（値は aipictors-api の ACCOUNT_LEAVE_REASONS） */
export const ACCOUNT_LEAVE_REASONS: LeaveSurveyReason[] = [
  {
    value: "not_using",
    label: ["あまり使わなくなった", "I don't use it much anymore"],
    text: detailText(
      [
        "使わなくなった理由を具体的に教えてください",
        "Tell us more about why you stopped using it",
      ],
      [
        "例: 仕事が忙しく、しばらく創作できない",
        "e.g. I'm too busy to create for a while",
      ],
    ),
    groups: [
      {
        id: "why",
        question: ["あてはまるものを選んでください", "Which of these apply?"],
        options: [
          { value: "no_time", label: ["時間がない", "I don't have time"] },
          {
            value: "lost_interest",
            label: ["AI イラストへの興味が薄れた", "I lost interest in AI art"],
          },
          {
            value: "hard_to_use",
            label: ["使い方が分かりにくい", "It's hard to use"],
          },
          {
            value: "only_generate",
            label: ["生成だけで十分だった", "I only needed generation"],
          },
        ],
      },
    ],
  },
  {
    value: "privacy",
    label: ["身バレ・個人情報が心配", "I'm worried about privacy"],
    text: detailText(
      [
        "差し支えない範囲で、心配なことを具体的に教えてください",
        "Tell us what worries you, as far as you're comfortable",
      ],
      [
        "例: 職場の人にアカウントを見つけられた",
        "e.g. Someone from work found my account",
      ],
    ),
    groups: [
      {
        id: "what",
        question: ["どんなことが心配ですか？", "What worries you?"],
        options: [
          {
            value: "known",
            label: [
              "知り合いに見られたくない",
              "I don't want people I know to see it",
            ],
          },
          {
            value: "works_public",
            label: [
              "作品を公開したままにしたくない",
              "I don't want my works to stay public",
            ],
          },
          {
            value: "ai_use",
            label: [
              "AI を使っていると知られたくない",
              "I don't want people to know I use AI",
            ],
          },
          {
            value: "data",
            label: [
              "データの扱いが心配",
              "I'm worried about how data is handled",
            ],
          },
        ],
      },
    ],
  },
  {
    value: "harassment",
    label: [
      "嫌なコメント・やりとりがあった",
      "I had unpleasant comments or interactions",
    ],
    groups: [
      {
        id: "what",
        question: ["どこでありましたか？", "Where did it happen?"],
        options: [
          { value: "comments", label: ["コメント", "Comments"] },
          { value: "messages", label: ["メッセージ", "Messages"] },
          { value: "requests", label: ["リクエスト", "Requests"] },
          {
            value: "repost",
            label: ["無断転載・なりすまし", "Reposting or impersonation"],
          },
          {
            value: "outside",
            label: [
              "サイトの外（SNS など）",
              "Outside the site (social media, etc.)",
            ],
          },
        ],
      },
    ],
    text: detailText(
      [
        "差し支えない範囲で、状況を教えてください（運営で確認して対応します）",
        "Tell us what happened, as far as you're comfortable (we'll look into it)",
      ],
      [
        "例: 投稿のたびに同じ人から嫌なコメントが来る",
        "e.g. The same person leaves rude comments on every post",
      ],
    ),
  },
  {
    value: "community",
    label: [
      "サイトの雰囲気・ルールが合わない",
      "The atmosphere or rules don't suit me",
    ],
    text: detailText(
      [
        "どんなところが合わなかったか、具体的に教えてください",
        "Tell us more about what didn't suit you",
      ],
      [
        "例: ランキングが同じ人ばかりで見る気がしない",
        "e.g. The rankings are always the same people",
      ],
    ),
    groups: [
      {
        id: "what",
        question: ["どんなところですか？", "What exactly?"],
        options: [
          {
            value: "rules",
            label: [
              "ルール・審査が厳しい",
              "Rules or moderation are too strict",
            ],
          },
          {
            value: "r18",
            label: ["R-18 作品が目に入る", "I see too much R-18 content"],
          },
          {
            value: "ranking",
            label: [
              "ランキング・推しの雰囲気",
              "Rankings or the support (oshi) culture",
            ],
          },
          {
            value: "low_quality",
            label: ["作品の質が合わない", "The works aren't my taste"],
          },
          { value: "ads", label: ["広告が多い", "Too many ads"] },
        ],
      },
    ],
  },
  {
    value: "not_popular",
    label: [
      "作品を見てもらえない・反応が少ない",
      "My works don't get seen or get little response",
    ],
    text: detailText(
      [
        "どんな作品を、どれくらい投稿していましたか",
        "What kind of works did you post, and how often?",
      ],
      [
        "例: 週3枚ほどアニメ調を投稿して、いいねは毎回1〜2",
        "e.g. About 3 anime works a week, 1–2 likes each",
      ],
    ),
    groups: [
      {
        id: "why",
        question: ["あてはまるものを選んでください", "Which of these apply?"],
        options: [
          { value: "few_views", label: ["閲覧が少ない", "Few views"] },
          {
            value: "few_likes",
            label: ["いいね・コメントが少ない", "Few likes or comments"],
          },
          {
            value: "ranking",
            label: ["ランキングに載らない", "I never make the rankings"],
          },
          {
            value: "discover",
            label: [
              "見つけてもらう方法が分からない",
              "I don't know how to get discovered",
            ],
          },
        ],
      },
    ],
  },
  IMAGE_QUALITY_REASON,
  BUG_REASON,
  {
    value: "cost",
    label: ["料金・コインが合わない", "Pricing or coins don't work for me"],
    text: detailText(
      [
        "具体的に教えてください（足りない機能や、払える金額など）",
        "Tell us more (what you'd need, what you'd pay, etc.)",
      ],
      [
        "例: 無料のコインでは1日5枚しか作れない",
        "e.g. Free coins only cover about 5 images a day",
      ],
    ),
    groups: [
      {
        id: "what",
        question: ["あてはまるものを選んでください", "Which of these apply?"],
        options: [
          {
            value: "plan",
            label: ["有料プランが高い", "Paid plans are expensive"],
          },
          {
            value: "coins",
            label: ["コインがすぐなくなる", "Coins run out quickly"],
          },
          {
            value: "free_less",
            label: ["無料でできることが少ない", "Not enough for free"],
          },
        ],
      },
    ],
  },
  {
    value: "other_service",
    label: ["ほかのサービスに移る", "I'm moving to another service"],
    groups: SERVICE_GROUPS,
    text: SERVICE_TEXT,
  },
  {
    value: "new_account",
    label: ["アカウントを作り直したい", "I want to start a new account"],
    text: detailText(
      [
        "作り直したい理由を具体的に教えてください",
        "Tell us more about why you want a new account",
      ],
      [
        "例: 名前を変えたいが、ID を変える方法が分からない",
        "e.g. I want a new name but couldn't find how to change my ID",
      ],
    ),
    groups: [
      {
        id: "why",
        question: ["あてはまるものを選んでください", "Which of these apply?"],
        options: [
          {
            value: "rename",
            label: ["名前・ID を変えたい", "I want a different name or ID"],
          },
          {
            value: "fresh",
            label: ["作品を整理して始め直したい", "I want a fresh start"],
          },
          {
            value: "merge",
            label: [
              "別のアカウントにまとめたい",
              "I want to merge into another account",
            ],
          },
        ],
      },
    ],
  },
  {
    value: "other",
    label: ["その他", "Something else"],
    groups: [],
    text: {
      label: ["理由を教えてください", "Please tell us why"],
      placeholder: [
        "例: しばらく創作から離れるため",
        "e.g. I'm taking a break from creating",
      ],
      required: true,
    },
  },
]

export const leaveSurveyReasons = (kind: LeaveSurveyKind) =>
  kind === "subscription" ? SUBSCRIPTION_LEAVE_REASONS : ACCOUNT_LEAVE_REASONS

/** 今の答えで出す追加質問（showIf の条件を満たすものだけ） */
export const visibleLeaveSurveyGroups = (
  reason: LeaveSurveyReason | undefined,
  choices: Record<string, string[]>,
) =>
  (reason?.groups ?? []).filter(
    (group) =>
      !group.showIf ||
      (choices[group.showIf.group] ?? []).includes(group.showIf.value),
  )

/** まだ答えていないもの（追加質問はどれも 1 つ以上、詳しい説明は LEAVE_SURVEY_MIN_TEXT 文字以上が必須） */
export const leaveSurveyMissing = (
  kind: LeaveSurveyKind,
  answer: LeaveSurveyAnswer,
) => {
  const reason = leaveSurveyReasons(kind).find(
    (item) => item.value === answer.reason,
  )
  if (!reason) return { reason: true, groups: [] as string[], text: false }
  return {
    reason: false,
    groups: visibleLeaveSurveyGroups(reason, answer.choices)
      .filter((group) => (answer.choices[group.id] ?? []).length === 0)
      .map((group) => group.id),
    text:
      reason.text?.required === true &&
      answer.text.trim().length < LEAVE_SURVEY_MIN_TEXT,
  }
}

/** 送れる状態か（理由を選び、追加質問にすべて答え、詳しい説明を書いた） */
export const isLeaveSurveyComplete = (
  kind: LeaveSurveyKind,
  answer: LeaveSurveyAnswer,
) => {
  const missing = leaveSurveyMissing(kind, answer)
  return !missing.reason && missing.groups.length === 0 && !missing.text
}

/** aipictors-api に送る details（見えていない質問の答えは送らない） */
export const toLeaveSurveyDetails = (
  kind: LeaveSurveyKind,
  answer: LeaveSurveyAnswer,
) => {
  const reason = leaveSurveyReasons(kind).find(
    (item) => item.value === answer.reason,
  )
  const choices: Record<string, string[]> = {}
  for (const group of visibleLeaveSurveyGroups(reason, answer.choices)) {
    const picked = answer.choices[group.id] ?? []
    if (picked.length > 0) choices[group.id] = picked
  }
  return {
    choices,
    text: reason?.text ? answer.text.trim().slice(0, 500) : "",
    improvement: answer.improvement.trim().slice(0, 1000),
    source: "web",
  }
}

/** 集計の表示用: 今の理由に加えて、選択肢から外した古い理由も探す */
const findReasonForLabel = (kind: LeaveSurveyKind, reasonValue: string) =>
  [...leaveSurveyReasons(kind), LEGACY_QUALITY_REASON].find(
    (item) => item.value === reasonValue,
  )

/** 集計の表示用: 理由の追加質問（古い理由も含む） */
export const leaveSurveyGroupsForLabel = (
  kind: LeaveSurveyKind,
  reasonValue: string,
) => findReasonForLabel(kind, reasonValue)?.groups ?? []

/** 集計の表示用: 理由・質問・選択肢の値から日本語の文言 */
export const leaveSurveyLabel = (
  kind: LeaveSurveyKind,
  reasonValue: string,
  groupId?: string,
  optionValue?: string,
) => {
  const reason = findReasonForLabel(kind, reasonValue)
  if (!groupId) return reason?.label[0] ?? reasonValue
  const group = reason?.groups.find((item) => item.id === groupId)
  if (!optionValue) return group?.question[0] ?? groupId
  return (
    group?.options.find((item) => item.value === optionValue)?.label[0] ??
    optionValue
  )
}
