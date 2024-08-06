import { AuthContext } from "~/contexts/auth-context"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import { WORK_COUNT_DEFINE } from "~/routes/($lang)._main._index/route"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  dateText: string
}

/**
 * 生成された作品セクション
 */
export function HomeWorksGeneratedSection(props: Props) {
  const appContext = useContext(AuthContext)

  const { data: resp } = useQuery(query, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: WORK_COUNT_DEFINE.GENERATION_WORKS,
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

export const HomeGenerationWorkFragment = graphql(
  `fragment HomeGenerationWork on WorkNode @_unmask {
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

const query = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeGenerationWork
    }
  }`,
  [HomeGenerationWorkFragment],
)
