import { FollowButton } from "~/components/button/follow-button"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  user: FragmentOf<typeof FollowerListItemFragment>
}

export function FollowerUserProfileItem(props: Props) {
  const MAX_LENGTH = 40 // Set your desired最大文字数

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`
    }
    return text
  }

  return (
    <>
      {/* モバイル表示 */}
      <div className="flex flex-col space-y-2 md:hidden md:flex-row">
        <Link to={`/users/${props.user.id}`} className="md:mr-4 md:flex">
          <div className="flex">
            <Avatar className="mt-2 mr-2">
              <AvatarImage
                src={props.user.iconUrl ?? ""}
                alt={props.user.name}
              />
              <AvatarFallback />
            </Avatar>
            <div className="w-full md:w-48">
              <p className="mb-1 font-bold text-md">{props.user.name}</p>
              <p className="mb-2 max-h-16 overflow-hidden text-sm opacity-80">
                {truncateText(props.user.biography ?? "", MAX_LENGTH)}
              </p>
            </div>
          </div>
        </Link>
        <div className="mb-2">
          <FollowButton
            targetUserId={props.user.id}
            isFollow={props.user.isFollowee}
          />
        </div>
      </div>
      {/* デスクトップ表示 */}
      <div className="hidden flex-col items-center space-y-2 md:flex md:flex-row">
        <Link
          to={`/users/${props.user.id}`}
          className="items-center md:mr-4 md:flex"
        >
          <Avatar className="mt-2 mr-2">
            <AvatarImage src={props.user.iconUrl ?? ""} alt={props.user.name} />
            <AvatarFallback />
          </Avatar>
          <div className="w-full">
            <p className="mb-1 font-bold text-md">{props.user.name}</p>
            <p className="mb-2 max-h-16 overflow-hidden text-sm opacity-80">
              {truncateText(props.user.biography ?? "", MAX_LENGTH)}
            </p>
          </div>
        </Link>
        <div className="ml-auto w-40">
          <FollowButton
            targetUserId={props.user.id}
            isFollow={props.user.isFollowee}
          />
        </div>
      </div>
    </>
  )
}

export const FollowerListItemFragment = graphql(
  `fragment FollowerListItem on UserNode  @_unmask {
    id
    name
    iconUrl
    biography
    isFollowee
  }`,
)

export const FollowerListItemWorkFragment = graphql(
  `fragment FollowerListItemWork on WorkNode  @_unmask {
    id
    title
    smallThumbnailImageURL
    isLiked
    user {
      id
    }
  }`,
)
