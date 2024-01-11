import { UserProfileAvatar } from "@/app/[lang]/(main)/users/[user]/_components/user-profile-avatar"
import { FollowButton } from "@/app/_components/button/follow-button"
// user-profile.tsx
import React from "react"
import { UserProfileInfo } from "./user-profile-info"

type UserProfileProps = {
  userQuery: {
    user: {
      name: string
      iconImage?: {
        downloadURL: string
      }
      receivedLikesCount: number
      receivedViewsCount: number
      awardsCount: number
      followersCount: number
      biography?: string
    }
  }
}

const UserProfile = ({ userQuery }: UserProfileProps) => {
  return (
    <header className="relative h-64">
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-4 py-6 bg-gradient-to-t from-background/40">
        <div className="flex items-center gap-4">
          <UserProfileAvatar
            alt={userQuery.user.name}
            src={userQuery.user.iconImage?.downloadURL}
          />
          <UserProfileInfo
            name={userQuery.user.name}
            receivedLikesCount={userQuery.user.receivedLikesCount}
            receivedViewsCount={userQuery.user.receivedViewsCount}
            awardsCount={userQuery.user.awardsCount}
            followersCount={userQuery.user.followersCount}
            biography={userQuery.user.biography || ""}
          />
        </div>
        <FollowButton />
      </div>
    </header>
  )
}

export default UserProfile
