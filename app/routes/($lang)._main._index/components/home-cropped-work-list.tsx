import { LikeButton } from "~/components/like-button"
import { graphql, type FragmentOf } from "gql.tada"
import { Link } from "@remix-run/react"

type Props = {
  works: FragmentOf<typeof HomeCoppedWorkFragment>[]
  isRanking?: boolean
}

/**
 * クロップ済み作品一覧
 */
export const HomeCroppedWorkList = (props: Props) => {
  if (!props.works || props.works.length === 0) {
    return null
  }

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-6">
      {props.works.map((work) => (
        <Link to={`/posts/${work.id}`} key={work.id} className="relative">
          <div
            className="w-full overflow-hidden"
            style={{ paddingBottom: "100%" }}
          >
            <img
              src={work.largeThumbnailImageURL}
              alt={work.title}
              className="absolute top-0 left-0 h-full w-full rounded-md object-cover"
            />
            <div className="absolute right-2 bottom-2">
              <LikeButton
                size={56}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.user.id}
                defaultLiked={work.isLiked}
                defaultLikedCount={0}
                isBackgroundNone={true}
                strokeWidth={2}
                isParticle={true}
              />
            </div>
          </div>
          {/* <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
            {work.title}
          </p>
          <UserNameBadge
            userId={work.user.id}
            userIconImageURL={IconUrl(work.user.iconUrl)}
            name={work.user.name}
            width={"lg"}
          /> */}
        </Link>
      ))}
    </section>
  )
}

/**
 * TODO_2024_09: 不要なフィールドを削除する
 */
export const HomeCoppedWorkFragment = graphql(
  `fragment HomeCoppedWork on WorkNode @_unmask {
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
