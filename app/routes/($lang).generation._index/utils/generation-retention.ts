/**
 * 生成画像の保存期間（aipictors-api の src/lib/generation-retention.ts と同じ値）
 *
 * 期限を過ぎた画像はすぐには消さず、GRACE_DAYS のあいだ残す（履歴ではグレーにして、プランで戻せると案内する）。
 * そのあと画像だけを消し、生成情報（プロンプトや設定）は履歴に残す。
 * 期限は今のプランで決まるので、上のプランに入ればその期間の画像は戻る。保護した画像は消えない
 */

export type RetentionPlan = "FREE" | "LITE" | "STANDARD" | "PREMIUM"

export const RETENTION_DAYS: Record<RetentionPlan, number> = {
  FREE: 90,
  LITE: 180,
  STANDARD: 365,
  PREMIUM: 730,
}

/** 期限を過ぎてから画像を消すまで */
export const RETENTION_GRACE_DAYS = 30

/** 期限が近いことを知らせ始める日数 */
export const RETENTION_WARN_DAYS = 14

/** 保存期間で消し始める日（2027/01/01 00:00 JST、秒） */
export const RETENTION_ENFORCE_FROM = Date.parse("2026-12-31T15:00:00Z") / 1000

const DAY_SECONDS = 86400

const PLANS: RetentionPlan[] = ["FREE", "LITE", "STANDARD", "PREMIUM"]

export type RetentionState =
  /** まだ余裕がある（保護したものもここ） */
  | { kind: "kept" }
  /** もうすぐ期限 */
  | { kind: "expiring"; daysLeft: number; restorePlan: RetentionPlan | null }
  /** 期限切れ。画像はまだ残っていて、プランで戻せる */
  | { kind: "expired"; daysLeft: number; restorePlan: RetentionPlan | null }
  /** 画像は消えた（生成情報だけ残る） */
  | { kind: "deleted" }

const toPlan = (plan: string | null | undefined): RetentionPlan =>
  PLANS.includes(plan as RetentionPlan) ? (plan as RetentionPlan) : "FREE"

/** この画像を期限内に戻せるいちばん安いプラン（今より上のものだけ） */
export function toRestorePlan(
  ageSeconds: number,
  plan: string | null | undefined,
): RetentionPlan | null {
  const current = PLANS.indexOf(toPlan(plan))
  return (
    PLANS.slice(current + 1).find(
      (candidate) => RETENTION_DAYS[candidate] * DAY_SECONDS > ageSeconds,
    ) ?? null
  )
}

export function toRetentionState(props: {
  /** 生成した日時（秒） */
  completedAt: number | null | undefined
  isProtected: boolean | null | undefined
  plan: string | null | undefined
  nowSeconds: number
}): RetentionState {
  if (props.isProtected || !props.completedAt) return { kind: "kept" }
  const plan = toPlan(props.plan)
  // 消し始める日より前に期限が来るものは、その日を期限にする
  const expiresAt = Math.max(
    props.completedAt + RETENTION_DAYS[plan] * DAY_SECONDS,
    RETENTION_ENFORCE_FROM,
  )
  const deleteAt = expiresAt + RETENTION_GRACE_DAYS * DAY_SECONDS
  const restorePlan = toRestorePlan(props.nowSeconds - props.completedAt, plan)
  if (props.nowSeconds >= deleteAt) return { kind: "deleted" }
  if (props.nowSeconds >= expiresAt) {
    return {
      kind: "expired",
      daysLeft: Math.max(
        1,
        Math.ceil((deleteAt - props.nowSeconds) / DAY_SECONDS),
      ),
      restorePlan,
    }
  }
  const daysLeft = Math.ceil((expiresAt - props.nowSeconds) / DAY_SECONDS)
  if (daysLeft <= RETENTION_WARN_DAYS) {
    return {
      kind: "expiring",
      daysLeft,
      restorePlan: toRestorePlan(
        props.nowSeconds - props.completedAt + daysLeft * DAY_SECONDS,
        plan,
      ),
    }
  }
  return { kind: "kept" }
}

/**
 * 画像がなく生成情報だけが残っている履歴か（保存期間を過ぎて画像を消したもの）。
 * できあがったのに画像がないそのほかの履歴は、今まで通り一覧に出さない
 */
export function isInfoOnlyHistory(
  task: {
    status?: string | null
    imageUrl?: string | null
    completedAt?: number | null
    isProtected?: boolean | null
  },
  plan: string | null | undefined,
  nowSeconds: number,
): boolean {
  return (
    task.status === "DONE" &&
    !task.imageUrl &&
    toRetentionState({
      completedAt: task.completedAt,
      isProtected: task.isProtected,
      plan,
      nowSeconds,
    }).kind === "deleted"
  )
}

export function toRetentionPlanLabel(
  plan: RetentionPlan,
  isEnglish: boolean,
): string {
  const labels: Record<RetentionPlan, [string, string]> = {
    FREE: ["無料", "Free"],
    LITE: ["ライト", "Lite"],
    STANDARD: ["スタンダード", "Standard"],
    PREMIUM: ["プレミアム", "Premium"],
  }
  return labels[plan][isEnglish ? 1 : 0]
}

/** 保存期間の書き方（3か月・1年など） */
export function toRetentionPeriodLabel(
  plan: RetentionPlan,
  isEnglish: boolean,
): string {
  const months = Math.round(RETENTION_DAYS[plan] / 30.4)
  if (months % 12 === 0) {
    const years = months / 12
    return isEnglish ? `${years} year${years > 1 ? "s" : ""}` : `${years}年`
  }
  return isEnglish ? `${months} months` : `${months}か月`
}
