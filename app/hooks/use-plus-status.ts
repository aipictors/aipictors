import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

/**
 * guest: 未ログイン / free: ログイン中でプランなし / member: 加入中 / unknown: 確認中
 */
export type PlusStatus = "unknown" | "guest" | "free" | "member"

/**
 * Aipictors+ の案内を出す相手かどうか（メニュー・ヘッダーなど、どのページにも出る案内で使う）
 * 確認中は "unknown" にして、加入中の人に一瞬だけ案内が出ないようにする
 */
export function usePlusStatus(): PlusStatus {
  const authContext = useContext(AuthContext)

  const { data, loading } = useQuery(viewerPlusStatusQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  if (authContext.isLoading) return "unknown"
  if (authContext.isNotLoggedIn) return "guest"
  if (loading || data === undefined || !data.viewer) return "unknown"
  return data.viewer.currentPass === null ? "free" : "member"
}

// 広告の出し分け（ad-slot.tsx の ViewerAdFreePass）と同じ項目。先に読まれていればキャッシュで返る
const viewerPlusStatusQuery = graphql(
  `query ViewerPlusStatus {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)
