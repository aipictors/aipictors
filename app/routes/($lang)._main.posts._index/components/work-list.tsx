import { graphql, type FragmentOf } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"

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
        <div key={work.id}>
          <CroppedWorkSquare
            workId={work.id}
            imageUrl={work.smallThumbnailImageURL}
            thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
            size="lg"
            imageWidth={work.smallThumbnailImageWidth}
            imageHeight={work.smallThumbnailImageHeight}
          />
        </div>
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
