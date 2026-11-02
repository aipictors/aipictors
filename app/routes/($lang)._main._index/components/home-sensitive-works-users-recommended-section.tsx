import { AuthContext } from "~/contexts/auth-context"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { isFeaturableSensitiveWork } from "~/utils/sensitive-tag-filter"

type Props = {
  works: FragmentOf<typeof HomePromotionWorkFragment>[]
  style?: IntrospectionEnum<"ImageStyle">
}

/**
 * ユーザからの推薦作品
 */
export function HomeSensitiveWorksUsersRecommendedSection (props: Props) {
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

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeRecommendedWorkList
          title={t("ユーザからの推薦", "Recommended by users")}
          works={workDisplayed}
          isCropped={false}
          isShowProfile={true}
          autoPlayVideoPreview={true}
          priorityCount={2}
        />
      )}
    </>
  )
}

export const HomePromotionWorkFragment = graphql(
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
