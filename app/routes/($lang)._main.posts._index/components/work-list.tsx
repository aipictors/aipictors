import { WorkCard } from "~/routes/($lang)._main.posts._index/components/work-card"
import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof WorkListItemFragment>[]
}

/**
 * 作品画像一覧
 */
export function WorkList(props: Props) {
  return (
    <ul className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8">
      {props.works.map((work) => (
        <Link key={work.id} to={`/posts/${work.id}`}>
          <WorkCard
            imageURL={work.largeThumbnailImageURL}
            imageWidth={work.largeThumbnailImageWidth}
            imageHeight={work.largeThumbnailImageHeight}
          />
        </Link>
      ))}
    </ul>
  )
}

export const WorkListItemFragment = graphql(
  `fragment WorkListItem on WorkNode @_unmask {
    id
    title
    enTitle
    enDescription
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
