/**
 * 紹介特典の内容（付与は aipictors-api の lib/referrals.ts。数字を変えるときは両方を直す）
 * 未ログインの人にも出すので、画面には固定の値を持つ（ログイン中は API の値を使う）
 */
export const REFERRAL_REWARDS = {
  /** 紹介リンクから登録した人に */
  signup: 300,
  /** 紹介された人がはじめて生成・投稿したとき、紹介した人に */
  action: 300,
  /** 紹介された人がはじめてプランの支払いをしたとき、紹介した人に */
  paid: 2000,
} as const

/** フリーコインの有効日数 */
export const REFERRAL_COIN_TTL_DAYS = 7

/** 紹介した人が特典を受け取れる人数（月ごと） */
export const REFERRAL_MONTHLY_LIMIT = 20

/** 目立たせるボタン（/plus の申込みボタンと同じ色づかい） */
export const referralCtaClassName =
  "h-11 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:opacity-95 hover:shadow-violet-500/40 active:scale-[0.98] motion-reduce:transition-none dark:text-white"
