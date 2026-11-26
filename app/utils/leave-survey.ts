/**
 * 解約・退会の理由のアンケート（主な理由 + 理由ごとの追加質問 + 自由記述）
 * - 保存は aipictors-api（解約: subscription_cancel_reasons.details、退会: account_leave_reasons）。形は lib/leave-survey.ts の sanitizeLeaveDetails
 * - アプリ（aipictors/app の lib/v2/settings/leave_survey.dart）も同じ値を使う。値（value）は集計に使うので変えない。文言は変えてよい
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

/** 「その他」の自由記述の最低文字数 */
export const LEAVE_SURVEY_MIN_TEXT = 5

export const emptyLeaveSurveyAnswer = (): LeaveSurveyAnswer => ({
  reason: null,
  choices: {},
  text: "",
  improvement: "",
})

const QUALITY_GROUPS: LeaveSurveyGroup[] = [
  {
    id: "problem",
    question: ["どんなところが気になりましたか？", "What bothered you?"],
    options: [
      {
        value: "face_hand",
        label: ["顔や手が崩れる", "Faces or hands look broken"],
      },
      {
        value: "errors",
        label: ["エラーで失敗した", "Generations failed with errors"],
      },
      {
        value: "style",
        label: ["画風が合わない", "The art style didn't suit me"],
      },
      {
        value: "prompt",
        label: ["プロンプト通りにならない", "Results didn't follow my prompt"],
      },
      { value: "wait", label: ["待ち時間が長い", "Long waits"] },
      {
        value: "feature",
        label: [
          "特定の機能がうまく動かない",
          "A specific feature didn't work well",
        ],
      },
    ],
  },
  {
    id: "feature",
    question: ["どの機能ですか？", "Which feature?"],
    showIf: { group: "problem", value: "feature" },
    options: [
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
      {
        value: "lora",
        label: ["LoRA・みんなのモデル", "LoRA / community models"],
      },
      {
        value: "special_model",
        label: [
          "Flux・Gemini などの特別なモデル",
          "Special models (Flux, Gemini, etc.)",
        ],
      },
      { value: "mosaic", label: ["自動モザイク", "Auto mosaic"] },
      { value: "post", label: ["投稿・作品ページ", "Posting / work pages"] },
      { value: "other_feature", label: ["その他", "Other"] },
    ],
  },
]

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
  label: ["サービス名・理由など（任意）", "Service name or details (optional)"],
  placeholder: [
    "例: ○○の新しいモデルが使いたい",
    "e.g. I want to try a new model on ...",
  ],
}

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
  {
    value: "quality",
    label: ["生成の品質・不具合が気になった", "Quality problems or bugs"],
    groups: QUALITY_GROUPS,
    text: {
      label: ["どんな状況でしたか（任意）", "What happened? (optional)"],
      placeholder: [
        "例: 高画質化すると毎回エラーになる",
        "e.g. Upscaling always fails",
      ],
    },
  },
  {
    value: "slow",
    label: [
      "生成が遅い・待ち時間が長い",
      "Generation is slow or the wait is long",
    ],
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
    text: {
      label: [
        "よければ状況を教えてください（任意）",
        "Tell us what happened if you like (optional)",
      ],
      placeholder: ["運営で確認して対応します", "We'll look into it"],
    },
  },
  {
    value: "community",
    label: [
      "サイトの雰囲気・ルールが合わない",
      "The atmosphere or rules don't suit me",
    ],
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
  {
    value: "quality",
    label: ["生成の品質・不具合が気になった", "Quality problems or bugs"],
    groups: QUALITY_GROUPS,
  },
  {
    value: "cost",
    label: ["料金・コインが合わない", "Pricing or coins don't work for me"],
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

/** 送れる状態か（理由を選び、「その他」は自由記述を LEAVE_SURVEY_MIN_TEXT 文字以上） */
export const isLeaveSurveyComplete = (
  kind: LeaveSurveyKind,
  answer: LeaveSurveyAnswer,
) => {
  const reason = leaveSurveyReasons(kind).find(
    (item) => item.value === answer.reason,
  )
  if (!reason) return false
  if (reason.text?.required) {
    return answer.text.trim().length >= LEAVE_SURVEY_MIN_TEXT
  }
  return true
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

/** 集計の表示用: 理由・質問・選択肢の値から日本語の文言 */
export const leaveSurveyLabel = (
  kind: LeaveSurveyKind,
  reasonValue: string,
  groupId?: string,
  optionValue?: string,
) => {
  const reason = leaveSurveyReasons(kind).find(
    (item) => item.value === reasonValue,
  )
  if (!groupId) return reason?.label[0] ?? reasonValue
  const group = reason?.groups.find((item) => item.id === groupId)
  if (!optionValue) return group?.question[0] ?? groupId
  return (
    group?.options.find((item) => item.value === optionValue)?.label[0] ??
    optionValue
  )
}
