import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { RECOMMENDED_PAD_COUNT } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { isFeaturableSensitiveWork } from "~/utils/sensitive-tag-filter"

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

  // 推薦作品
  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading || !viewerRatings.isReady,
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

  const workDisplayed =
    recommendedWorksResp?.works.filter(isFeaturableSensitiveWork) ?? props.works

  const t = useTranslation()
  // ブラウザで取り直したとき（ログイン中の人の年齢区分で）は埋める分を使わない。全年齢のトップと同じ
  const fillWorks = recommendedWorksResp ? [] : (props.fillWorks ?? [])
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
