import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import { AuthContext } from "~/contexts/auth-context"
import {
  toNormalModeRatings,
  toSensitiveModeRatings,
  type ViewerRating,
} from "~/utils/viewer-ratings"

type Result = {
  /**
   * ログイン状態と閲覧レーティング設定が確定しているかどうか
   */
  isReady: boolean
  /**
   * 通常モードの一覧で使うレーティング
   */
  normalRatings: ViewerRating[]
  /**
   * センシティブモードの一覧で使うレーティング
   */
  sensitiveRatings: ViewerRating[]
}

const ANONYMOUS_R18G_KEY = "showR18G"
const ANONYMOUS_R18G_EVENT = "aipictors:show-r18g"

const readAnonymousR18g = () => {
  try {
    return localStorage.getItem(ANONYMOUS_R18G_KEY) === "true"
  } catch {
    return false
  }
}

const subscribeAnonymousR18g = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(ANONYMOUS_R18G_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(ANONYMOUS_R18G_EVENT, onChange)
  }
}

/**
 * 未ログインの人の R18G の表示設定（端末に記憶する）
 */
export function setAnonymousR18gEnabled(isEnabled: boolean): void {
  try {
    localStorage.setItem(ANONYMOUS_R18G_KEY, isEnabled ? "true" : "false")
  } catch {
    // 保存できない環境では変わらない
  }
  window.dispatchEvent(new Event(ANONYMOUS_R18G_EVENT))
}

const PREFERENCE_RATING_KEY = "aipictors:preference-rating"

type CachedPreference = {
  userId: string
  rating: ViewerRating | null
}

const readCachedPreference = (userId: string): CachedPreference | null => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(PREFERENCE_RATING_KEY) ?? "null",
    ) as CachedPreference | null
    return cached?.userId === userId ? cached : null
  } catch {
    return null
  }
}

/**
 * ログインユーザの閲覧レーティング設定（設定 > 表示コンテンツ）を一覧のクエリ条件に変換する
 */
export function useViewerRatings(): Result {
  const authContext = useContext(AuthContext)

  const { data, loading } = useQuery(viewerPreferenceRatingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })

  const isAnonymousR18gEnabled = useSyncExternalStore(
    subscribeAnonymousR18g,
    readAnonymousR18g,
    () => false,
  )

  const isLoggedIn = authContext.isLoggedIn

  // 前回の設定で一覧の取得を先に始める（設定の取得を待つと一覧が 1 往復遅れる）
  const userId = authContext.userId
  const cachedPreference = useMemo(
    () => (isLoggedIn && userId ? readCachedPreference(userId) : null),
    [isLoggedIn, userId],
  )

  const fetchedRating = data?.userSetting?.preferenceRating

  useEffect(() => {
    if (!userId || fetchedRating === undefined) return
    try {
      localStorage.setItem(
        PREFERENCE_RATING_KEY,
        JSON.stringify({ userId, rating: fetchedRating }),
      )
    } catch {
      // 保存できなくても、設定の取得を待つだけ
    }
  }, [userId, fetchedRating])

  const preferenceRating = isLoggedIn
    ? (fetchedRating ?? (loading ? cachedPreference?.rating : null) ?? null)
    : isAnonymousR18gEnabled
      ? "R18G"
      : null

  const isReady =
    authContext.isNotLoggedIn ||
    (authContext.isLoggedIn && (!loading || cachedPreference !== null))

  const normalRatings = useMemo(
    () => toNormalModeRatings({ isLoggedIn, preferenceRating }),
    [isLoggedIn, preferenceRating],
  )

  const sensitiveRatings = useMemo(
    () => toSensitiveModeRatings({ isLoggedIn, preferenceRating }),
    [isLoggedIn, preferenceRating],
  )

  return { isReady, normalRatings, sensitiveRatings }
}

export const viewerPreferenceRatingQuery = graphql(`
  query ViewerPreferenceRating {
    userSetting {
      id
      preferenceRating
    }
  }
`)
