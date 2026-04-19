import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { LikeButton } from "~/components/like-button"
import { FollowButton } from "~/components/button/follow-button"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  user: FragmentOf<typeof FolloweeListItemFragment>
  works: FragmentOf<typeof FolloweeListItemWorkFragment>[]
}

export function FollowingUserItem (props: Props) {
  const MAX_LENGTH = 40 // Set your desired maximum length

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`
    }
    return text
  }
  console.log("(props.user)", props.user)

  return (
    <div className="flex flex-col space-y-2 md:flex-row">
      <div className="flex flex-col space-y-2 md:mr-4">
        <Link to={`/users/${props.user.id}`} className="flex">
          <UserAvatarWithFrame
            alt={props.user.name}
            frame={props.user.avatarFrame}
            isAnimated={false}
            frameClassName="mt-2 mr-2"
            sizeClassName="size-10"
            src={withIconUrlFallback(props.user.iconUrl)}
          />
          <div className="w-full md:w-48">
            <p className="mb-1 font-bold text-md">{props.user.name}</p>
            <p className="mb-2 max-h-16 overflow-hidden text-sm opacity-80">
              {truncateText(props.user.biography ?? "", MAX_LENGTH)}
            </p>
          </div>
        </Link>
        <div className="full mb-2">
          <FollowButton
            targetUserId={props.user.id}
            isFollow={props.user.isFollowee}
          />
        </div>
        <div className="text-sm opacity-50">
          {props.user.finalPostedAt &&
          props.user.finalPostedAt * 1000 <= Date.now()
            ? new Date(props.user.finalPostedAt * 1000).toLocaleString()
            : ""}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 md:justify-start">
        {props.works.map((work, index) => (
          <Link
            to={`/posts/${work.id}`}
            key={index.toString()}
            className="relative block"
          >
            <div className="size-32 rounded-md">
              <img
                className="size-32 object-cover"
                alt={work.title}
                key={work.id}
                src={work.smallThumbnailImageURL}
              />
            </div>
            <div className="absolute right-0 bottom-0">
              <LikeButton
                size={56}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.user?.id ?? ""}
                defaultLiked={work.isLiked}
                defaultLikedCount={0}
                isBackgroundNone={true}
                strokeWidth={2}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const FolloweeListItemFragment = graphql(
  `fragment FolloweeListItem on UserNode  @_unmask {
    id
    name
    iconUrl
    avatarFrame {
      id
      frameType
      backgroundStyle
      overlayImageUrl
      borderPadding
    }
    biography
    isFollowee
    finalPostedAt
  }`,
)

export const FolloweeListItemWorkFragment = graphql(
  `fragment FolloweeListItemWork on WorkNode  @_unmask {
    id
    title
    smallThumbnailImageURL
    isLiked
    user {
      id
    }
  }`,
)
