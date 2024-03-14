import { UserProfileAvatar } from "@/app/[lang]/(main)/users/[user]/_components/user-profile-avatar"
import { FollowButton } from "@/app/_components/button/follow-button"
import type { UserQuery } from "@/graphql/__generated__/graphql"
import UserProfileInfo from "./user-profile-info"

type UserProfileProps = {
  user: NonNullable<UserQuery["user"]>
}

const UserProfile = (props: UserProfileProps) => {
  return (
    <header className="relative h-64 px-4">
      <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center bg-gradient-to-t from-background/40 px-4 py-6">
        <div className="flex items-center gap-4">
          <UserProfileAvatar
            alt={props.user.name}
            src={props.user.iconImage?.downloadURL}
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
        <FollowButton />
      </div>
    </header>
  )
}

export default UserProfile
