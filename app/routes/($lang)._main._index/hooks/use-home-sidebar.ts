import { useMutation, useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import {
  homeSidebarQuery,
  randomCustomerAdvertisementQuery,
  updateClickedCountCustomerAdvertisementMutation,
  viewerCurrentPassQuery,
} from "~/routes/($lang)._main._index/components/home-sidebar-queries"
import type { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import type { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import type { HomeLoaderData } from "~/routes/($lang)._main._index/home-loader.server"
import type { HomeTab } from "~/routes/($lang)._main._index/utils/home-tabs"

/**
 * ホームの右カラム（広告、新しいユーザー、新しいコメント）の取得
 */
export function useHomeSidebar(props: {
  currentTab: HomeTab
  isMounted: boolean
  data: HomeLoaderData
}) {
  const { currentTab, isMounted, data } = props

  // 表示を引き継いだ（hydration）あとに取りに行く。typeof window で分けると、
  // サーバーは何も出さずブラウザは読み込み中の枠を出すので食い違い（React #418）、ページ全体が作り直しになっていた
  const shouldLoadHomeSidebarQueries = currentTab === "home" && isMounted

  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: !shouldLoadHomeSidebarQueries,
    fetchPolicy: "cache-first",
  })
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    skip: !shouldLoadHomeSidebarQueries,
    fetchPolicy: "cache-first",
    variables: {
      where: {
        isSensitive: false,
        page: "work",
      },
    },
  })
  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )
  const { data: homeSidebarData, loading: isHomeSidebarLoading } = useQuery(
    homeSidebarQuery,
    {
      skip: !shouldLoadHomeSidebarQueries,
      fetchPolicy: "cache-first",
    },
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      await updateClickedCountCustomerAdvertisement({
        variables: {
          id: advertisements.randomCustomerAdvertisement.id,
        },
      })
    }
  }

  const passData = pass?.viewer?.currentPass
  const isSubscriptionUser =
    passData?.type === "LITE" ||
    passData?.type === "STANDARD" ||
    passData?.type === "PREMIUM"
  const sidebarNewPostedUsers = (
    Array.isArray(homeSidebarData?.newPostedUsers)
      ? homeSidebarData.newPostedUsers
      : data.newPostedUsers
  ) as FragmentOf<typeof HomeNewPostedUsersFragment>[]
  const sidebarNewComments = (
    Array.isArray(homeSidebarData?.newComments)
      ? homeSidebarData.newComments
      : data.newComments
  ) as FragmentOf<typeof HomeNewCommentsFragment>[]

  return {
    advertisements,
    onClickAdvertisement,
    isSubscriptionUser,
    isHomeSidebarLoading,
    sidebarNewPostedUsers,
    sidebarNewComments,
  }
}
