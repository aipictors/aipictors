import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useMemo } from "react"
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

  const isLoggedIn = authContext.isLoggedIn

  const preferenceRating = isLoggedIn
    ? (data?.userSetting?.preferenceRating ?? null)
    : null

  const isReady =
    authContext.isNotLoggedIn || (authContext.isLoggedIn && !loading)

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

const viewerPreferenceRatingQuery = graphql(`
  query ViewerPreferenceRating {
    userSetting {
      id
      preferenceRating
    }
  }
`)
