import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { HomeNovelsWorksSection } from "@/routes/($lang)._main._index/_components/home-novels-works-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  title: string
  isSensitive?: boolean
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * 小説作品一覧
 */
export const HomeNovelsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: novelWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "NOVEL",
      },
    },
  })

  const workDisplayed = novelWorks?.works ?? props.works

  return <HomeNovelsWorksSection works={workDisplayed} title={props.title} />
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
