import { FollowButton } from "@/_components/button/follow-button"
import { UserProfileAvatar } from "@/routes/($lang)._main.users.$user/_components/user-profile-avatar"
import UserProfileInfo from "./user-profile-info"
import type { userQuery } from "@/_graphql/queries/user/user"
import type { ResultOf } from "gql.tada"
import { IconUrl } from "@/_components/icon-url"

type UserProfileProps = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
}

const UserProfile = (props: UserProfileProps) => {
  return (
    <header className="relative h-64 px-4">
      <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center bg-gradient-to-t from-background/40 px-4 py-6">
        <div className="flex items-center gap-4">
          <UserProfileAvatar
            alt={props.user.name}
            src={IconUrl(props.user.iconUrl)}
          />
          <UserProfileInfo
            name={props.user.name}
            receivedLikesCount={props.user.receivedLikesCount}
            receivedViewsCount={props.user.receivedViewsCount}
            awardsCount={props.user.awardsCount}
            followersCount={props.user.followersCount}
            biography={props.user.biography || ""}
          />
        </div>
        <FollowButton targetUserId={props.user.id} isFollow={false} />
      </div>
    </header>
  )
}

export default UserProfile
