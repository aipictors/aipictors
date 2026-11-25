import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

/**
 * 自分の画面に推し（コインでの応援）・推しランキングを出さない設定（user_settings.hide_coin_support）
 * - 本人の画面だけ。推しの受け付け（isRejectCoinSupport）や記録・報酬とは関係しない
 * - 未ログイン・読み込み中は false（今まで通り表示する）
 * - 同じクエリを Apollo のキャッシュで共有するので、何か所で呼んでも取得は 1 回
 */
export function useHideCoinSupport(): boolean {
  const authContext = useContext(AuthContext)

  const { data } = useQuery(hideCoinSupportQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-first",
  })

  if (authContext.isNotLoggedIn) {
    return false
  }

  return data?.userSetting?.isHideCoinSupport ?? false
}

export const hideCoinSupportQuery = graphql(
  `query HideCoinSupportSetting {
    userSetting {
      id
      isHideCoinSupport
    }
  }`,
)
