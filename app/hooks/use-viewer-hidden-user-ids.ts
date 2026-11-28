import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useMemo } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { toHiddenUserIds } from "~/utils/hidden-user-works"

const NO_IDS: ReadonlySet<string> = new Set()

/**
 * ログイン中の人の一覧から外す作者の id（ブロックした人と、「ミュートしたユーザーの作品を表示する」がオフのときのミュートした人）。
 * トップの一覧はサーバーで未ログインとして取ってキャッシュしているので、API のミュート・ブロックの絞り込みが効かない。ブラウザでこれを使って外す
 */
export function useViewerHiddenUserIds(): ReadonlySet<string> {
  const authContext = useContext(AuthContext)
  const { data } = useQuery(viewerHiddenUsersQuery, {
    skip: !authContext.isLoggedIn,
  })
  return useMemo(
    () =>
      data
        ? toHiddenUserIds({
            mutedUserIds: (data.viewer?.mutedUsers ?? []).map((u) => u.id),
            blockedUserIds: (data.viewer?.blockedUsers ?? []).map((u) => u.id),
            isShowingMutedUsersWorks:
              data.userSetting?.isShowingMutedUsersWorks ?? null,
          })
        : NO_IDS,
    [data],
  )
}

const viewerHiddenUsersQuery = graphql(
  `query ViewerHiddenUsers {
    viewer {
      id
      mutedUsers(offset: 0, limit: 128) {
        id
      }
      blockedUsers(offset: 0, limit: 128) {
        id
      }
    }
    userSetting {
      isShowingMutedUsersWorks
    }
  }`,
)
