/**
 * 設定の検索（設定の上の検索欄）
 *
 * ページだけでなく、ページの中の項目（パスワード・退会・R18 など）でも探せるようにする。
 * ひらがなとカタカナは同じものとして比べ、全角・半角や大文字・小文字、長音（ユーザ／ユーザー）の違いも無視する。
 * 漢字の項目は keywords に読み（ひらがな）を入れておく（「つうち」で「通知」が見つかる）
 */

export type SettingsSearchEntry = {
  href: string
  ja: string
  en: string
  /** 項目のとき、入っているページの名前 */
  pageJa?: string
  pageEn?: string
  /** 読み・言い換え（日本語・英語どちらでもよい） */
  keywords?: string[]
}

type Page = Omit<SettingsSearchEntry, "pageJa" | "pageEn"> & {
  items?: Omit<SettingsSearchEntry, "href" | "pageJa" | "pageEn">[]
  /** 項目が別の URL にあるとき（アカウントの下の階層など） */
  itemHrefs?: Record<string, string>
}

const PAGES: Page[] = [
  {
    href: "/settings/profile",
    ja: "プロフィール",
    en: "Profile",
    keywords: ["ぷろふぃーる", "自己紹介", "じこしょうかい", "bio"],
    items: [
      {
        ja: "ニックネーム",
        en: "Nickname",
        keywords: ["名前", "なまえ", "表示名", "ひょうじめい", "name"],
      },
      {
        ja: "プロフィール画像",
        en: "Profile Image",
        keywords: ["アイコン", "画像", "がぞう", "icon", "avatar"],
      },
      {
        ja: "ヘッダー画像",
        en: "Header Image",
        keywords: ["背景", "はいけい", "カバー", "cover", "banner"],
      },
      {
        ja: "自己紹介",
        en: "Introduction",
        keywords: ["じこしょうかい", "プロフィール文", "bio", "about"],
      },
      {
        ja: "英語プロフィール",
        en: "English Profile",
        keywords: ["えいご", "英語", "english"],
      },
      {
        ja: "リンク・連絡先",
        en: "Links & Contact",
        keywords: [
          "れんらくさき",
          "Webサイト",
          "ウェブサイト",
          "X",
          "ツイッター",
          "Twitter",
          "SNS",
          "website",
          "url",
        ],
      },
      {
        ja: "ピックアップ作品",
        en: "Pickups",
        keywords: ["さくひん", "作品", "おすすめ", "pickup", "works"],
      },
      {
        ja: "アイコン枠",
        en: "Avatar Frame",
        keywords: ["わく", "枠", "フレーム", "ガチャ", "frame", "gacha"],
      },
      {
        ja: "ヘッダー枠",
        en: "Header Frame",
        keywords: [
          "へっだーわく",
          "わく",
          "枠",
          "フレーム",
          "ガチャ",
          "header frame",
          "gacha",
        ],
      },
      {
        ja: "R18 のプロフィール",
        en: "R18 profile",
        keywords: ["センシティブ", "FANZA", "ファンザ", "sensitive", "adult"],
      },
    ],
  },
  {
    href: "/settings/account",
    ja: "アカウント設定",
    en: "Account Settings",
    keywords: ["あかうんと", "account"],
    itemHrefs: {
      ユーザID: "/settings/account/login",
      パスワード: "/settings/account/password",
      退会: "/settings/account/withdrawal",
    },
    items: [
      {
        ja: "ユーザID",
        en: "User ID",
        keywords: ["ゆーざーid", "ユーザーID", "ログインID", "id", "login"],
      },
      {
        ja: "パスワード",
        en: "Password",
        keywords: ["ぱすわーど", "password", "pass"],
      },
      {
        ja: "メールアドレス",
        en: "Email address",
        keywords: ["めーる", "mail", "email", "確認メール"],
      },
      {
        ja: "SNSアカウント紐付け",
        en: "Link SNS Accounts",
        keywords: [
          "ひもづけ",
          "紐づけ",
          "連携",
          "れんけい",
          "Google",
          "グーグル",
          "X",
          "Twitter",
          "ツイッター",
          "ログイン",
          "link",
          "connect",
        ],
      },
      {
        ja: "退会",
        en: "Withdraw Account",
        keywords: [
          "たいかい",
          "アカウント削除",
          "削除",
          "さくじょ",
          "やめる",
          "delete",
          "withdraw",
          "remove account",
        ],
      },
    ],
  },
  {
    href: "/settings/discord",
    ja: "Discord 連携",
    en: "Discord",
    keywords: ["でぃすこーど", "ディスコード", "れんけい", "ロール", "role"],
  },
  {
    href: "/settings/points",
    ja: "コイン",
    en: "Coins",
    keywords: ["こいん", "ポイント", "point", "coin"],
    items: [
      {
        ja: "フリーコイン",
        en: "Free coins",
        keywords: ["毎日のコイン", "まいにち", "daily"],
      },
      {
        ja: "プレミアムコイン",
        en: "Premium coins",
        keywords: ["購入", "こうにゅう", "課金", "かきん", "buy"],
      },
      {
        ja: "コインの履歴",
        en: "Coin history",
        keywords: ["りれき", "履歴", "使った", "もらった", "history"],
      },
      {
        ja: "推しポイント・貢献度",
        en: "Support & Contribution Points",
        keywords: [
          "おし",
          "推し",
          "こうけんど",
          "ランキング",
          "ranking",
          "support",
        ],
      },
    ],
  },
  {
    href: "/settings/support-received",
    ja: "応援コイン受け取り",
    en: "Received Support Coins",
    keywords: [
      "おうえん",
      "うけとり",
      "受取",
      "推し",
      "おし",
      "投げ銭",
      "なげせん",
      "support",
      "tip",
    ],
    itemHrefs: {
      "推しの受け取り（受け取り拒否）":
        "/settings/support-received#receive-setting",
      "推しの表示（推し・推しランキングを表示しない）":
        "/settings/support-received#hide-coin-support",
    },
    items: [
      {
        ja: "推しの受け取り（受け取り拒否）",
        en: "Receiving support (decline coins)",
        keywords: [
          "拒否",
          "きょひ",
          "受け取り拒否",
          "受け取らない",
          "うけとらない",
          "受け付けない",
          "うけつけない",
          "コインを受け取らない",
          "推しを止める",
          "パロディ",
          "ぱろでぃ",
          "reject",
          "decline",
          "refuse",
          "opt out",
        ],
      },
      {
        ja: "推しの表示（推し・推しランキングを表示しない）",
        en: "Hide support and support rankings",
        keywords: [
          "表示しない",
          "ひょうじしない",
          "非表示",
          "ひひょうじ",
          "隠す",
          "かくす",
          "見たくない",
          "みたくない",
          "推しを隠す",
          "推しランキング",
          "おしらんきんぐ",
          "hide",
          "hide support",
          "support ranking",
        ],
      },
    ],
  },
  {
    href: "/settings/creator-rewards",
    ja: "収益の受け取り（クリエイター報酬）",
    en: "Rewards payout (Creator Rewards)",
    keywords: [
      "しゅうえき",
      "ほうしゅう",
      "報酬",
      "振込",
      "ふりこみ",
      "銀行",
      "ぎんこう",
      "口座",
      "こうざ",
      "源泉徴収",
      "税金",
      "ぜいきん",
      "くりえいたー",
      "収益化",
      "お金",
      "おかね",
      "payout",
      "bank",
      "revenue",
      "money",
    ],
  },
  {
    href: "/requests/my-plans",
    ja: "リクエストとプラン",
    en: "Requests & Plans",
    keywords: [
      "りくえすと",
      "ぷらん",
      "依頼",
      "いらい",
      "有料リクエスト",
      "commission",
    ],
  },
  {
    href: "/settings/notification",
    ja: "通知・いいね",
    en: "Notifications & Likes",
    keywords: ["つうち", "おしらせ", "お知らせ", "notification"],
    items: [
      {
        ja: "コメントの通知を受け取る",
        en: "Receive comment notifications",
        keywords: ["こめんと", "つうち", "comment"],
      },
      {
        ja: "いいねの通知を受け取る",
        en: "Receive notifications for likes",
        keywords: ["いいね", "つうち", "like"],
      },
      {
        ja: "匿名いいねの通知を受け取る",
        en: "Receive anonymous like notifications",
        keywords: ["とくめい", "つうち", "anonymous"],
      },
      {
        ja: "いいねを匿名にする",
        en: "Make likes anonymous",
        keywords: [
          "とくめい",
          "いいねの表示",
          "非公開",
          "ひこうかい",
          "隠す",
          "かくす",
          "R-15",
          "センシティブ",
          "anonymous",
          "hide likes",
        ],
      },
    ],
  },
  {
    href: "/settings/push-notification",
    ja: "Push通知",
    en: "Push Notifications",
    keywords: [
      "ぷっしゅ",
      "プッシュ通知",
      "つうち",
      "スマホ",
      "アプリ",
      "通知が届かない",
      "とどかない",
      "push",
    ],
  },
  {
    href: "/settings/restriction",
    ja: "表示コンテンツ",
    en: "Display Content",
    keywords: ["ひょうじ", "こんてんつ", "年齢制限", "ねんれい", "display"],
    items: [
      {
        ja: "R18作品を見られるようにする（18歳以上）",
        en: "Allow R18 works (18+)",
        keywords: [
          "R18",
          "成人向け",
          "せいじん",
          "センシティブ",
          "えっち",
          "エロ",
          "年齢確認",
          "ねんれい",
          "adult",
          "nsfw",
          "sensitive",
        ],
      },
      {
        ja: "R15作品を表示する",
        en: "Show R15 works",
        keywords: ["R15", "R-15"],
      },
      {
        ja: "R18G作品を表示する",
        en: "Show R18G works",
        keywords: ["R18G", "グロ", "ぐろ", "gore"],
      },
      {
        ja: "ヘッダーに「全年齢／R18」の切り替えを表示する",
        en: "Show the All ages / R18 switch in the header",
        keywords: [
          "ぜんねんれい",
          "切り替え",
          "きりかえ",
          "ヘッダー",
          "header",
        ],
      },
    ],
  },
  {
    href: "/settings/color",
    ja: "カラーテーマ",
    en: "Color Theme",
    keywords: ["からー", "色", "いろ", "テーマ", "theme", "color", "colour"],
    items: [
      {
        ja: "ダークモード",
        en: "Dark mode",
        keywords: ["だーく", "黒", "くろ", "暗い", "くらい", "夜", "dark"],
      },
      {
        ja: "ライトモード",
        en: "Light mode",
        keywords: ["らいと", "白", "しろ", "明るい", "あかるい", "light"],
      },
    ],
  },
  {
    href: "/settings/followed/tags",
    ja: "お気に入りタグ",
    en: "Followed Tags",
    keywords: ["おきにいり", "たぐ", "フォロー", "follow", "favorite", "tag"],
  },
  {
    href: "/settings/muted/users",
    ja: "ユーザミュート",
    en: "Muted Users",
    keywords: [
      "ゆーざー",
      "ユーザー",
      "みゅーと",
      "非表示",
      "ひひょうじ",
      "mute",
      "user",
    ],
  },
  {
    href: "/settings/blocked/users",
    ja: "ユーザブロック",
    en: "Blocked Users",
    keywords: [
      "ゆーざー",
      "ユーザー",
      "ぶろっく",
      "拒否",
      "きょひ",
      "block",
      "user",
    ],
  },
  {
    href: "/settings/muted/tags",
    ja: "タグミュート",
    en: "Muted Tags",
    keywords: ["たぐ", "みゅーと", "非表示", "ひひょうじ", "mute", "tag"],
  },
  {
    href: "/settings/sticker",
    ja: "スタンプ",
    en: "Stickers",
    keywords: ["すたんぷ", "ステッカー", "sticker", "stamp"],
    items: [
      {
        ja: "デフォルトのスタンプを表示しない",
        en: "Hide default stickers",
        keywords: ["でふぉると", "既定", "きてい", "default"],
      },
    ],
  },
  {
    href: "/models/library?section=mine",
    ja: "自分のモデル",
    en: "My Models",
    keywords: ["じぶん", "もでる", "LoRA", "ろら", "model"],
  },
]

export const SETTINGS_SEARCH_ENTRIES: SettingsSearchEntry[] = PAGES.flatMap(
  (page) => [
    { href: page.href, ja: page.ja, en: page.en, keywords: page.keywords },
    ...(page.items ?? []).map((item) => ({
      ...item,
      href: page.itemHrefs?.[item.ja] ?? page.href,
      pageJa: page.ja,
      pageEn: page.en,
    })),
  ],
)

/**
 * 比べる形にそろえる: 全角英数→半角、大文字→小文字、カタカナ→ひらがな、空白や記号を外す
 */
export const normalizeSettingsSearchText = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    // 長音も外す（「ユーザ」と「ユーザー」を同じにする）
    .replace(/[\s・･\-‐ー〜~_（）()「」『』【】／/、。,.!?！？&＆]/g, "")

const scoreEntry = (entry: SettingsSearchEntry, terms: string[]): number => {
  const titles = [entry.ja, entry.en].map(normalizeSettingsSearchText)
  const others = [
    ...(entry.keywords ?? []),
    entry.pageJa ?? "",
    entry.pageEn ?? "",
  ].map(normalizeSettingsSearchText)
  let score = 0
  for (const term of terms) {
    if (titles.some((title) => title === term)) {
      score += 100
    } else if (titles.some((title) => title.startsWith(term))) {
      score += 60
    } else if (titles.some((title) => title.includes(term))) {
      score += 40
    } else if (others.some((text) => text === term)) {
      score += 30
    } else if (others.some((text) => text.includes(term))) {
      score += 15
    } else {
      // 1 語でも当たらなければ出さない
      return 0
    }
  }
  // 同じくらいならページを先に
  return entry.pageJa === undefined ? score + 1 : score
}

/** 検索する（空白区切りの語をすべて含むもの、よく当たる順） */
export const searchSettings = (
  query: string,
  entries: SettingsSearchEntry[] = SETTINGS_SEARCH_ENTRIES,
): SettingsSearchEntry[] => {
  const terms = query
    .normalize("NFKC")
    .split(/\s+/)
    .map(normalizeSettingsSearchText)
    .filter((term) => term !== "")
  if (terms.length === 0) return []
  return entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.entry)
}
