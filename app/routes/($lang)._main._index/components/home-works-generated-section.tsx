import { AuthContext } from "~/contexts/auth-context"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { HomeGenerationWorkSection } from "~/routes/($lang)._main._index/components/home-generation-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"

type Props = {
  works: FragmentOf<typeof HomeGenerationWorkFragment>[]
  dateText: string
  onSelect?: (index: string) => void
}

/**
 * 生成された作品セクション
 */
export function HomeWorksGeneratedSection (props: Props) {
  const appContext = useContext(AuthContext)

  const { data: resp } = useQuery(WorksQuery, {
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
      <HomeGenerationWorkSection
        title={"作品を選んで無料生成"}
        works={workDisplayed}
        isCropped={false}
        isShowProfile={true}
        onSelect={props.onSelect}
      />
    </>
  )
}

export const HomeGenerationWorkFragment = graphql(
  `fragment HomeGenerationWork on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeGenerationWork
    }
  }`,
  [HomeGenerationWorkFragment],
)
