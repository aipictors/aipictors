import { FollowButton } from "~/components/button/follow-button"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  user: FragmentOf<typeof FollowerListItemFragment>
  works: FragmentOf<typeof FollowerListItemWorkFragment>[]
}

export const FollowerUserItem = (props: Props) => {
  const MAX_LENGTH = 40 // Set your desired maximum length

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`
    }
    return text
  }

  return (
    <div className="flex">
      <div className="mr-4 flex">
        <Link to={`/users/${props.user.id}`}>
          <Avatar className="mt-2 mr-2">
            <AvatarImage src={props.user.iconUrl ?? ""} alt={props.user.name} />
            <AvatarFallback />
          </Avatar>
        </Link>
        <div className="w-48">
          <p className="mb-1 font-bold text-md">{props.user.name}</p>
          <p className="mb-2 text-sm opacity-80">
            {truncateText(props.user.biography ?? "", MAX_LENGTH)}
          </p>
          <div className="mb-2">
            <FollowButton
              targetUserId={props.user.id}
              isFollow={props.user.isFollowee}
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {props.works.map((work, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Link to={`/posts/${work.id}`} key={index}>
            <div className="h-32 w-32 rounded-md">
              <img
                className="h-32 w-32 object-cover"
                alt={work.title}
                key={work.id}
                src={work.smallThumbnailImageURL}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
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
  }`,
)
