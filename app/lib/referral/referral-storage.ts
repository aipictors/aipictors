/**
 * 紹介リンク（?ref=<コード>）を端末に覚えておき、登録したあとでひも付ける
 * ページは URL ごとにキャッシュされるので、サーバーでは ref を読まない（ブラウザだけで扱う）
 */
const REFERRAL_STORAGE_KEY = "aipictors-referral"
const DEVICE_ID_STORAGE_KEY = "aipictors-device-id"
const BANNER_DISMISSED_KEY = "aipictors-referral-banner-dismissed"

/** 覚えておく期間（リンクを踏んでから 30 日） */
export const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** ひも付けを試す回数の上限（一時的な失敗が続いたらあきらめる） */
export const REFERRAL_MAX_ATTEMPTS = 5

export const REFERRAL_PARAM = "ref"

export type StoredReferral = {
  code: string
  /** リンクを踏んだ時刻（ミリ秒） */
  at: number
  /** ひも付けを試した回数 */
  attempts: number
}

/** 紹介コードとして受け付ける形（英小文字と数字。大文字は小文字にそろえる） */
export function toReferralCode(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null
  const code = value.trim().toLowerCase()
  return /^[a-z0-9]{6,16}$/.test(code) ? code : null
}

/** URL の ?ref= を外した「パス + クエリ + ハッシュ」を返す。ref がなければ null */
export function stripReferralParam(href: string): string | null {
  const url = new URL(href)
  if (!url.searchParams.has(REFERRAL_PARAM)) return null
  url.searchParams.delete(REFERRAL_PARAM)
  return `${url.pathname}${url.search}${url.hash}`
}

/** 保存した文字列を読む。形が違う・期限切れ・試しすぎは null */
export function parseStoredReferral(
  raw: string | null,
  now: number,
): StoredReferral | null {
  if (raw === null) return null
  try {
    const value = JSON.parse(raw) as Partial<StoredReferral> | null
    const code = toReferralCode(value?.code)
    if (code === null || typeof value?.at !== "number") return null
    if (now - value.at > REFERRAL_TTL_MS || value.at > now + 60_000) return null
    const attempts = typeof value.attempts === "number" ? value.attempts : 0
    if (attempts >= REFERRAL_MAX_ATTEMPTS) return null
    return { code, at: value.at, attempts }
  } catch {
    return null
  }
}

export function readStoredReferral(): StoredReferral | null {
  try {
    return parseStoredReferral(
      window.localStorage.getItem(REFERRAL_STORAGE_KEY),
      Date.now(),
    )
  } catch {
    return null
  }
}

/** 先に踏んだリンクを優先する（あとから別のリンクを踏んでも、期限内は上書きしない） */
export function saveReferral(code: string): StoredReferral | null {
  try {
    const existing = readStoredReferral()
    if (existing !== null) return existing
    const value: StoredReferral = { code, at: Date.now(), attempts: 0 }
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(value))
    return value
  } catch {
    // 保存できない端末（プライベートブラウズなど）では、ひも付けをあきらめる
    return null
  }
}

export function countReferralAttempt(referral: StoredReferral) {
  try {
    window.localStorage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify({ ...referral, attempts: referral.attempts + 1 }),
    )
  } catch {
    // 保存できなければ数えない
  }
}

export function clearStoredReferral() {
  try {
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY)
  } catch {
    // 消せなくても、次のひも付けはサーバーが断る
  }
}

/**
 * 端末を見分ける ID（同じ端末でアカウントを作り直して紹介特典を受け取るのを防ぐため。個人を特定する情報は含まない）
 */
export function getReferralDeviceId(): string | null {
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (existing !== null && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) {
      return existing
    }
    const id = crypto.randomUUID()
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, id)
    return id
  } catch {
    return null
  }
}

export function isReferralBannerDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(BANNER_DISMISSED_KEY) !== null
  } catch {
    return false
  }
}

export function dismissReferralBanner() {
  try {
    window.sessionStorage.setItem(BANNER_DISMISSED_KEY, "1")
  } catch {
    // 覚えられなければ、次のページでまた出るだけ
  }
}

/** 配るリンク。紹介ページ（/invite）に着くようにする（トップなどのキャッシュを ref ごとに増やさないため） */
export function buildReferralUrl(
  siteUrl: string,
  code: string,
  locale: "ja" | "en",
): string {
  return `${siteUrl}${locale === "en" ? "/en" : ""}/invite?${REFERRAL_PARAM}=${code}`
}
