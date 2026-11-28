import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerHiddenUserIds } from "~/hooks/use-viewer-hidden-user-ids"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { RECOMMENDED_PAD_COUNT } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { filterWorksByHiddenUsers } from "~/utils/hidden-user-works"
import { isFeaturableSensitiveWork } from "~/utils/sensitive-tag-filter"
import { filterWorksByRatings } from "~/utils/viewer-ratings"

type Props = {
  works: FragmentOf<typeof HomePromotionWorkFragment>[]
  /** 推薦の最後の行の穴埋めと「ほかのおすすめ」に使う作品（全年齢のトップと同じ） */
  fillWorks?: FragmentOf<typeof HomePromotionWorkFragment>[]
  style?: IntrospectionEnum<"ImageStyle">
}

/**
 * ユーザからの推薦作品
 */
export function HomeSensitiveWorksUsersRecommendedSection(props: Props) {
  const appContext = useContext(AuthContext)
  const viewerRatings = useViewerRatings()
  // サーバーの一覧は未ログインとして取っているので、ブロック・ミュートした人の作品をここで外す
  const hiddenUserIds = useViewerHiddenUserIds()

  // 推薦作品。サーバーで取った一覧があればそれを使い、ブラウザでは取り直さない（全年齢のトップと同じ）
  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip:
      appContext.isLoading || props.works.length > 0 || !viewerRatings.isReady,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.promotion,
      where: {
        isRecommended: true,
        ratings: viewerRatings.sensitiveRatings,
        ...(props.style && {
          style: props.style,
        }),
      },
    },
  })

  const workDisplayed = filterWorksByHiddenUsers(
    recommendedWorksResp?.works.filter(isFeaturableSensitiveWork) ??
      props.works,
    hiddenUserIds,
  )

  const t = useTranslation()
  // 「ほかのおすすめ」はブラウザで推薦を取り直しても消さない（閲覧者の年齢区分とミュート・ブロックで絞る）。
  // 以前は取り直すと消え、最初の HTML にあった 2,500px ほどの一覧がスクロール中に抜けて下が大きくずれていた（CLS）
  const fillWorks = filterWorksByHiddenUsers(
    filterWorksByRatings(props.fillWorks ?? [], viewerRatings.sensitiveRatings),
    hiddenUserIds,
  )
  const padWorks = fillWorks.slice(0, RECOMMENDED_PAD_COUNT)
  const restFillWorks =
    workDisplayed.length > 0
      ? fillWorks.slice(RECOMMENDED_PAD_COUNT)
      : fillWorks

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeRecommendedWorkList
          title={t("ユーザからの推薦", "Recommended by users")}
          works={workDisplayed}
          isCropped={false}
          isShowProfile={true}
          fillRows={true}
          padWorks={padWorks}
          autoPlayVideoPreview={true}
          priorityCount={2}
        />
      )}
      {restFillWorks.length > 0 && (
        <HomeRecommendedWorkList
          title={t("ほかのおすすめ", "More picks")}
          description={t(
            "直近の作品から、反応の多い作品やあなたの好みに近い作品",
            "Popular recent works picked for you",
          )}
          works={restFillWorks}
          isCropped={false}
          isShowProfile={true}
          fillRows={true}
          autoPlayVideoPreview={true}
          priorityCount={workDisplayed.length > 0 ? undefined : 2}
        />
      )}
    </>
  )
}

const HomePromotionWorkFragment = graphql(
  `fragment HomePromotionWork on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomePromotionWork
      tagNames
    }
  }`,
  [HomePromotionWorkFragment],
)
