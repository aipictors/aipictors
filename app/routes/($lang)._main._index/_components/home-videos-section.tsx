import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { HomeVideosWorksSection } from "@/routes/($lang)._main._index/_components/home-video-works-section"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  title: string
  isSensitive?: boolean
}

/**
 * 動画作品一覧
 */
export const HomeVideosSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: videoWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "VIDEO",
      },
    },
  })

  const workList = videoWorks?.works.filter((_, index) => index % 2 === 0) ?? []

  return <HomeVideosWorksSection works={workList} title={props.title} />
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
