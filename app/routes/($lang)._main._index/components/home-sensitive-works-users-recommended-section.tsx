import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof HomePromotionWorkFragment>[]
  style?: IntrospectionEnum<"ImageStyle">
}

/**
 * ユーザからの推薦作品
 */
export function HomeSensitiveWorksUsersRecommendedSection (props: Props) {
  const appContext = useContext(AuthContext)

  // 推薦作品
  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.promotion,
      where: {
        isRecommended: true,
        ratings: ["R18", "R18G"],
        ...(props.style && {
          style: props.style,
        }),
        isNowCreatedAt: true,
      },
    },
  })

  const workDisplayed = recommendedWorksResp?.works ?? props.works

  const t = useTranslation()

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeWorkSection
          title={t("ユーザからの推薦", "Recommended by users")}
          works={workDisplayed}
          isCropped={false}
          isShowProfile={true}
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
    }
  }`,
  [HomePromotionWorkFragment],
)
