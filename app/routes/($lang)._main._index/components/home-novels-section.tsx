import { AuthContext } from "~/contexts/auth-context"
import { HomeNovelsWorksSection } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"

type Props = {
  title: string
  isSensitive?: boolean
  works: FragmentOf<typeof HomeNovelPostFragment>[]
  dateText: string
}

/**
 * 小説作品一覧
 */
export const HomeNovelsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: novelWorks } = useQuery(WorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.novel,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "NOVEL",
        beforeCreatedAt: props.dateText,
      },
    },
  })

  const workDisplayed = novelWorks?.works ?? props.works

  return <HomeNovelsWorksSection works={workDisplayed} title={props.title} />
}

/**
 * TODO_2024_09: 不要なフィールドを削除する
 */
export const HomeNovelPostFragment = graphql(
  `fragment HomeNovelPost on WorkNode @_unmask {
    id
    title
    accessType
    adminAccessType
    type
    likesCount
    commentsCount
    bookmarksCount
    viewsCount
    createdAt
    rating
    isTagEditable
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    type
    prompt
    negativePrompt
    isLiked
    thumbnailImagePosition
    description
    url
    subWorksCount
    tags {
      name
    }
    user {
      id
      name
      iconUrl
    }
    uuid
  }`,
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeNovelPost
    }
  }`,
  [HomeNovelPostFragment],
)
