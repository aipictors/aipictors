import type { HelpText } from "~/routes/($lang)._main.help._index/components/help-sections"

/**
 * ヘルプの中身を最後に変えた日。サイトマップの lastmod に使う
 * （ビルド日時にすると毎デプロイで変わり、検索や AI Search が全ページを読み直すので、文を変えたときだけ手で上げる）
 */
export const HELP_UPDATED_AT = "2026-11-28"

/** Discord（ヘルプ・お問い合わせで案内している招待） */
export const HELP_DISCORD_URL = "https://discord.gg/7jA2MmtvtR"

/** 障害のときに見るページ（aipictors.com を 10 分ごとに確かめている稼働状況のページ） */
export const HELP_STATUS_URL = "https://aipictors-status.pages.dev"

/**
 * シリーズに入れられる作品の数（aipictors-system の lib/album-works-limit と同じ値。表示用）
 */
export const ALBUM_WORKS_LIMIT = {
  FREE: 48,
  LITE: 96,
  STANDARD: 120,
  PREMIUM: 120,
} as const

/** 最近変わったこと（新しい順。日付はコミットで確かめたもの） */
export const HELP_RECENT_CHANGES: Array<{
  date: string
  text: HelpText
  to?: string
}> = [
  {
    date: "2026-11-28",
    text: {
      ja: "トップの「クリエイターの宣伝」を「おすすめ作品」の一覧に。宣伝した作品は一覧の先頭に PR の印付きで表示し、残りは宣伝ではないおすすめ作品（PR の印なし）で埋めて空きマスを出さない",
      en: 'The home page\'s "From our creators" is now a "Recommended works" list: promoted works come first with a PR mark, and the rest is filled with regular recommended works (no PR mark) so there are no empty spots',
    },
    to: "/promotion",
  },
  {
    date: "2026-11-27",
    text: {
      ja: "作品への推しを終了し、推しはユーザーへの推しだけに（フリー・プレミアムとも。作品ページでは作者の欄の「作者を推す」から）。これまでの作品経由の推しも作者への推しとして数え、過去の推し付きコメントは本文だけで表示",
      en: 'Support on works has ended; support now goes to users only (free or premium; on work pages use "Support creator" in the creator box). Past support through works counts toward the creator, and past support comments show only their text',
    },
    to: "/fan-works-policy",
  },
  {
    date: "2026-11-26",
    text: {
      ja: "作品ページからのプレミアムコインの推しはオリジナル作品だけに（プロフィールからの推しはプレミアムコインも可）",
      en: "Premium-coin support from work pages is now for original works only (profile support can still use premium coins)",
    },
    to: "/fan-works-policy",
  },
  {
    date: "2026-11-26",
    text: {
      ja: "閲覧数: 投稿した本人が自分の作品を開いても増えないように",
      en: "Views: opening your own work no longer counts as a view",
    },
  },
  {
    date: "2026-11-25",
    text: {
      ja: "「推しの表示」の設定で、推しや推しランキングを画面に出さないようにできる",
      en: "New support display setting hides support and support rankings",
    },
    to: "/settings/oshi-display",
  },
  {
    date: "2026-11-25",
    text: {
      ja: "有料リクエストの納品・メッセージで GIF アニメと動画を送れるように",
      en: "Paid requests: GIF animations and videos can be delivered and sent in messages",
    },
    to: "/requests",
  },
  {
    date: "2026-11-21",
    text: {
      ja: "フリーコインで推された分は、推した枚数の 2/3 が受け取った人のフリーコインに（受け取りから 30 日有効）",
      en: "Free-coin support: 2/3 of the amount becomes the recipient's free coins (valid 30 days)",
    },
  },
  {
    date: "2026-11-21",
    text: {
      ja: "R18 の小説・コラムの一覧（/r/novels・/r/notes）を追加",
      en: "Added R18 novel and column lists (/r/novels, /r/notes)",
    },
  },
  {
    date: "2026-11-19",
    text: {
      ja: "推し: プレミアムコインも 1 枚から推せるように（よく使う枚数は 1・2・100・500・1,000）",
      en: "Support: premium coins can be sent from 1 again (quick picks 1, 2, 100, 500, 1,000)",
    },
  },
  {
    date: "2026-11-17",
    text: {
      ja: "生成画像の保存期間（2027 年 1 月 1 日から、プランごと）。期限を過ぎた画像は 30 日グレーで残る",
      en: "Generated image retention by plan (from Jan 1, 2027); expired images stay greyed out for 30 days",
    },
    to: "/help/generation",
  },
  {
    date: "2026-11-16",
    text: {
      ja: "クリエイター報酬（銀行振込）と有料リクエストを開始。Amazon ギフト券への交換は終了",
      en: "Creator rewards (bank payouts) and paid requests launched; Amazon gift card exchange ended",
    },
    to: "/help/creator-rewards",
  },
  {
    date: "2026-11-03",
    text: {
      ja: "無料生成の本人確認が Google でもできるように（LINE がなくてもよい）。Gemini に週の枠",
      en: "Free-generation verification now works with Google (no LINE needed); weekly Gemini allowance",
    },
    to: "/help/generation",
  },
]
