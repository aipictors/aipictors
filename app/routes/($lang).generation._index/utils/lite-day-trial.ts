/**
 * カード登録なしの「ライト1日体験」
 * 無料の上限まで使った人に、1 人 1 回だけ、その日（日本時間の 24:00 まで）はライトと同じ使い方（1 回 4 枚・あと 40 枚）を開放する。
 * 体験の記録と判定はサーバー（aipictors-api の lite_day_trials）。生成をライト扱いにするのも aipictors-system 側で決める
 */
export type LiteDayTrial = {
  /** available: 始められる / active: 今日体験中 / used: 以前使った / ineligible: 対象外 */
  status: string
  /** 体験した日（日本時間の YYYY-MM-DD） */
  trialDate: string | null
  /** 体験の終わり（UNIX 秒） */
  endsAt: number | null
}

/** 今体験中か（プランに入っている人は関係ない） */
export const isLiteDayTrialActive = (
  trial: LiteDayTrial | null | undefined,
  hasPass: boolean,
  now = Date.now(),
) => {
  if (hasPass || !trial || trial.status !== "active") return false
  return trial.endsAt === null || trial.endsAt * 1000 > now
}

/** 日本時間の今日の日付（YYYY-MM-DD） */
const toJstDateKey = (time: number) =>
  new Date(time + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)

/** 体験した日から何日たったか（日本時間の日付で数える） */
export const daysSinceLiteDayTrial = (
  trial: LiteDayTrial | null | undefined,
  now = Date.now(),
) => {
  if (!trial?.trialDate) return null
  const today = Date.parse(`${toJstDateKey(now)}T00:00:00Z`)
  const trialDay = Date.parse(`${trial.trialDate}T00:00:00Z`)
  if (Number.isNaN(trialDay)) return null
  return Math.round((today - trialDay) / 86_400_000)
}

/** 翌日以降に「昨日の続きを」と案内する期間（体験した日の翌日から 7 日間） */
export const LITE_DAY_FOLLOWUP_DAYS = 7

/** 「昨日の続きを」の案内を出すか（プランに入っていない・体験の翌日〜7 日後） */
export const shouldShowLiteDayFollowup = (
  trial: LiteDayTrial | null | undefined,
  hasPass: boolean,
  now = Date.now(),
) => {
  if (hasPass || trial?.status !== "used") return false
  const days = daysSinceLiteDayTrial(trial, now)
  return days !== null && days >= 1 && days <= LITE_DAY_FOLLOWUP_DAYS
}
