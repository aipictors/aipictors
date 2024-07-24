import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

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
      limit: 80,
      where: {
        isRecommended: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G"],
      },
    },
  })

  const workDisplayed = recommendedWorksResp?.works ?? props.works

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <HomeWorkSection
        title={"ユーザからの推薦"}
        works={workDisplayed}
        isCropped={!isDesktop}
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
