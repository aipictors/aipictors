import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * 生成された作品セクション
 */
export const HomeWorksGeneratedSection = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data: resp } = useQuery(worksQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 40,
      where: {
        orderBy: "LIKES_COUNT",
        sort: "DESC",
        ratings: ["G"],
        isFeatured: true,
        createdAtAfter: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toDateString(),
      },
    },
  })

  const workDisplayed = resp?.works ?? props.works

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <HomeWorkSection
        title={"作品を選んで無料生成"}
        works={workDisplayed}
        link="https://www.aipictors.com/search/?promptstatus=2&order=favorite"
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
