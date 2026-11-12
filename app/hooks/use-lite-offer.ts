import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { usePlusStatus } from "~/hooks/use-plus-status"
import {
  fetchTrialStatus,
  isTrialAsAdvertised,
  TRIAL_DAYS as API_TRIAL_DAYS,
  type TrialStatus,
} from "~/lib/trial-api"

/**
 * ライトの月払いで案内する特典
 * - trial: 7 日間無料お試し（一度もプランに入ったことがない人。未ログインの人にも「はじめての方は」と添えて出す）
 * - half: 初月半額（以前プランに入っていた人、お試しの受付を止めているとき）
 * - none: 加入中（案内しない）
 * - unknown: 確認中（どちらとも取れる表示にして、後から切り替わってちらつかないようにする）
 */
export type LiteOffer = "unknown" | "trial" | "half" | "none"

export const TRIAL_DAYS = API_TRIAL_DAYS

/**
 * 未ログインの人は「受付を止めていないか」だけ分かればよいので、端末に 3 時間覚えておく
 * （どのページにも出る案内で使うため、ページごとに聞くとアクセス数だけリクエストが増える）
 */
const GUEST_STORAGE_KEY = "aipictors-trial-open"
const GUEST_REMEMBER_MS = 3 * 60 * 60 * 1000

const readGuestOpen = (): boolean | null => {
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY)
    if (raw === null) return null
    const value = JSON.parse(raw) as { open?: unknown; until?: unknown }
    if (typeof value.open !== "boolean" || typeof value.until !== "number") {
      return null
    }
    return value.until > Date.now() ? value.open : null
  } catch (_error) {
    return null
  }
}

const rememberGuestOpen = (open: boolean) => {
  try {
    window.localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify({ open, until: Date.now() + GUEST_REMEMBER_MS }),
    )
  } catch (_error) {
    // 覚えられなければ次のページでまた聞く
  }
}

/** お試しを受け付けているか（未ログインの人向け。対象かどうかはログインするまで分からない） */
export const isTrialOpenForGuest = (status: TrialStatus) =>
  status.eligible !== false && isTrialAsAdvertised(status)

// 同じ画面の複数の場所で使うので、1 回取った結果を使い回す（キーはログイン中の人。未ログインは "guest"）
const cache = new Map<string, TrialStatus | "failed">()
const pending = new Map<string, Promise<TrialStatus | null>>()

const load = (key: string) => {
  const existing = pending.get(key)
  if (existing) return existing
  const promise = fetchTrialStatus().then((value) => {
    cache.set(key, value ?? "failed")
    if (key === "guest" && value !== null) {
      rememberGuestOpen(isTrialOpenForGuest(value))
    }
    return value
  })
  pending.set(key, promise)
  return promise
}

/** 決済から戻ったあとなど、取り直したいとき */
export const clearTrialStatusCache = () => {
  cache.clear()
  pending.clear()
}

export function useLiteOffer(): {
  offer: LiteOffer
  isGuest: boolean
  /** 直近のお試し（ログイン中で取れたときだけ） */
  latestTrial: TrialStatus["latestTrial"]
} {
  const authContext = useContext(AuthContext)
  const status = usePlusStatus()
  const key =
    status === "guest" ? "guest" : status === "unknown" ? null : authContext.userId

  const [, setVersion] = useState(0)
  const [guestOpen, setGuestOpen] = useState<boolean | null>(null)

  useEffect(() => {
    if (key === null || key === undefined) return
    if (key === "guest") {
      const remembered = readGuestOpen()
      if (remembered !== null) {
        setGuestOpen(remembered)
        return
      }
    }
    if (cache.has(key)) {
      setVersion((value) => value + 1)
      return
    }
    let isCancelled = false
    load(key).then(() => {
      if (!isCancelled) setVersion((value) => value + 1)
    })
    return () => {
      isCancelled = true
    }
  }, [key])

  if (status === "unknown" || key === null || key === undefined) {
    return { offer: "unknown", isGuest: false, latestTrial: null }
  }

  const value = cache.get(key)

  if (status === "guest") {
    const open =
      guestOpen ??
      (value === undefined
        ? null
        : value === "failed"
          ? false
          : isTrialOpenForGuest(value))
    if (open === null) return { offer: "unknown", isGuest: true, latestTrial: null }
    return { offer: open ? "trial" : "half", isGuest: true, latestTrial: null }
  }

  const latestTrial =
    value !== undefined && value !== "failed" ? value.latestTrial : null

  if (status === "member") return { offer: "none", isGuest: false, latestTrial }
  if (value === undefined) return { offer: "unknown", isGuest: false, latestTrial }
  // 判定を取れなかったときは、これまでどおり初月半額を案内する（お試しにできるかは決済のときにサーバーが決める）
  if (value === "failed") return { offer: "half", isGuest: false, latestTrial }
  return {
    offer: value.eligible === true && isTrialAsAdvertised(value) ? "trial" : "half",
    isGuest: false,
    latestTrial,
  }
}
