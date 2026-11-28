import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useMemo } from "react"
import { AuthContext } from "~/contexts/auth-context"

const NO_IDS: ReadonlySet<string> = new Set()

/**
 * ログイン中の人の一覧から外す作者の id（ブロックした人と、「ミュートしたユーザーの作品を表示する」がオンでないときのミュートした人）。
 * 作品の一覧の多くはサーバーで未ログインとして取ってキャッシュしているので、API のミュート・ブロックの絞り込みが効かない。ブラウザでこれを使って外す。
 * 判定は API の一覧と同じもの（viewer.hiddenWorkUserIds）を全員分使う（mutedUsers は 128 件までしか取れない）
 */
export function useViewerHiddenUserIds(): ReadonlySet<string> {
  const authContext = useContext(AuthContext)
  const { data } = useQuery(viewerHiddenUsersQuery, {
    skip: !authContext.isLoggedIn,
  })
  return useMemo(
    () =>
      data?.viewer?.hiddenWorkUserIds?.length
        ? new Set(data.viewer.hiddenWorkUserIds)
        : NO_IDS,
    [data],
  )
}

const viewerHiddenUsersQuery = graphql(
  `query ViewerHiddenUsers {
    viewer {
      id
      hiddenWorkUserIds
    }
  }`,
)
