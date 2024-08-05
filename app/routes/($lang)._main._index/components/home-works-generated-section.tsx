import { AuthContext } from "~/contexts/auth-context"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  dateText: string
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
      limit: config.query.homeWorkCount.generation,
      where: {
        orderBy: "DATE_CREATED",
        sort: "DESC",
        ratings: ["G"],
        isFeatured: true,
        beforeCreatedAt: props.dateText,
      },
    },
  })

  const workDisplayed = resp?.works ?? props.works

  return (
    <>
      <HomeWorkSection
        title={"作品を選んで無料生成"}
        works={workDisplayed}
        link="https://www.aipictors.com/search/?promptstatus=2&order=favorite"
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
