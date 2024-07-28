import { AuthContext } from "@/contexts/auth-context"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "@/routes/($lang)._main._index/components/home-work-section"
import { WORK_COUNT_DEFINE } from "@/routes/($lang)._main._index/route"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  isSensitive?: boolean
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * ユーザからの推薦作品
 */
export const HomeWorksUsersRecommendedSection = (props: Props) => {
  const appContext = useContext(AuthContext)

  // 推薦作品
  const { data: recommendedWorksResp } = useQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: WORK_COUNT_DEFINE.PROMOTION_WORKS,
      where: {
        isRecommended: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G"],
      },
    },
  })

  const workDisplayed = recommendedWorksResp?.works ?? props.works

  return (
    <>
      <HomeWorkSection
        title={"ユーザからの推薦"}
        works={workDisplayed}
        isCropped={false}
      />
    </>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
