import { AuthContext } from "~/contexts/auth-context"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "~/routes/($lang)._main._index/components/home-video-works-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"

type Props = {
  title: string
  isSensitive?: boolean
  works: FragmentOf<typeof HomeVideosWorkListItemFragment>[]
  dateText: string
}

/**
 * 動画作品一覧
 */
export function HomeVideosSection(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: videoWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.video,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "VIDEO",
        beforeCreatedAt: props.dateText,
      },
    },
  })

  const workDisplayed = videoWorks?.works ?? props.works

  return <HomeVideosWorksSection works={workDisplayed} title={props.title} />
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeVideosWorkListItem
    }
  }`,
  [HomeVideosWorkListItemFragment],
)
