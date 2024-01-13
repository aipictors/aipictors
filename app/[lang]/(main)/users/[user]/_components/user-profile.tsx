import { UserQuery } from "@/__generated__/apollo"
import { UserProfileAvatar } from "@/app/[lang]/(main)/users/[user]/_components/user-profile-avatar"
import { FollowButton } from "@/app/_components/button/follow-button"
// user-profile.tsx
import React from "react"
import UserProfileInfo from "./user-profile-info"

type UserProfileProps = {
  user: NonNullable<UserQuery["user"]>
}

const UserProfile = (props: UserProfileProps) => {
  return (
    <header className="relative h-64 px-4">
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-4 py-6 bg-gradient-to-t from-background/40">
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
