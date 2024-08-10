import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"

type Props = {
  isSensitive?: boolean
  works: FragmentOf<typeof HomeTagWorkFragment>[]
  tag: string
}

/**
 * タグ作品一覧
 */
export const HomeWorksTagSection = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.tag,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G"],
        search: props.tag, // タグによるフィルタリングを追加
        orderBy: "VIEWS_COUNT",
      },
    },
  })

  const workDisplayed = recommendedWorksResp?.works ?? props.works

  return (
    <>
      <HomeWorkSection title={""} works={workDisplayed} isCropped={false} />
    </>
  )
}

export const HomeTagWorkFragment = graphql(
  `fragment HomeTagWork on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeTagWork
    }
  }`,
  [HomeTagWorkFragment],
)
