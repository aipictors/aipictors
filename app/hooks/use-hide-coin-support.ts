import { useApolloClient, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useCallback, useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

/**
 * 自分の画面に推し（コインでの応援）・推しランキングを出さない設定（user_settings.hide_coin_support）
 * - 本人の画面だけ。推しの受け付け（isRejectCoinSupport）や記録・報酬とは関係しない
 * - 未ログイン・読み込み中は false（今まで通り表示する）
 * - 同じクエリを Apollo のキャッシュで共有するので、何か所で呼んでも取得は 1 回
 */
export function useHideCoinSupport(): boolean {
  return useHideCoinSupportState().isHide
}

/**
 * 設定の値と、読み込めたかどうか（その場で設定を変える入口は、読み込めたログイン中の人にだけ出す）
 */
export function useHideCoinSupportState(): {
  isHide: boolean
  isLoaded: boolean
} {
  const authContext = useContext(AuthContext)

  const { data } = useQuery(hideCoinSupportQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-first",
  })

  if (authContext.isNotLoggedIn) {
    return { isHide: false, isLoaded: false }
  }

  return {
    isHide: data?.userSetting?.isHideCoinSupport ?? false,
    isLoaded: data?.userSetting != null,
  }
}

/**
 * 設定を保存する。結果は同じ UserSetting としてキャッシュに入るので、読んでいる画面にすぐ反映される
 * - 押した欄が消えた後（トーストの「元に戻す」）でも呼べるように、Apollo の client を直接使う
 */
export function useSetHideCoinSupport() {
  const client = useApolloClient()

  return useCallback(
    async (isHide: boolean) => {
      await client.mutate({
        mutation: updateHideCoinSupportSettingMutation,
        variables: { input: { isHideCoinSupport: isHide } },
        refetchQueries: [hideCoinSupportQuery],
      })
    },
    [client],
  )
}

export const hideCoinSupportQuery = graphql(
  `query HideCoinSupportSetting {
    userSetting {
      id
      isHideCoinSupport
    }
  }`,
)

export const updateHideCoinSupportSettingMutation = graphql(
  `mutation UpdateHideCoinSupportSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      isHideCoinSupport
    }
  }`,
)
