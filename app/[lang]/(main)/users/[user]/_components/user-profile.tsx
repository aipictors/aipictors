"use client"

import type { UserQuery } from "@/__generated__/apollo"
import { UserMuteMenu } from "@/app/[lang]/(main)/users/[user]/_components/user-mute-menu"
import { UserPickUp } from "@/app/[lang]/(main)/users/[user]/_components/user-pick-up"
import { FollowButton } from "@/app/_components/button/follow-button"
import { LinkEmailButton } from "@/app/_components/button/link-email-button"
import { LinkWebButton } from "@/app/_components/button/link-web-button"
import { ShareButton } from "@/app/_components/button/share-button"
import { SocialInstagramButton } from "@/app/_components/button/social-instagram-button"
import { SocialTwitterButton } from "@/app/_components/button/social-twitter-button"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"
import { Award, Eye, Heart, Medal, User } from "lucide-react"

type Props = {
  user: NonNullable<UserQuery["user"]>
  userIconImageURL: string | null
  userReceivedLikesCount: number
  userReceivedViewsCount: number
  userFollowersCount: number
  userAwardsCount: number
  userBiography: string | null
  userName: string
}
/**
 * ユーザープロフィール
 * @param props
 * @returns
 */
export const UserProfile = (props: Props) => {
  return (
    <div className="flex flex-col">
      <Avatar>
        <AvatarImage alt={props.userName} src={props.userIconImageURL ?? ""} />
      </Avatar>
      <div className="flex">
        <span className="font-bold text-lg">{props.userName}</span>
        <FollowButton />
        <ShareButton />
        <UserMuteMenu />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="flex">
            <Heart className={"text-sm"} />
            <span className={"text-sm"}>{props.userReceivedLikesCount}</span>
            <span className={"text-sm"}>{"いいねされた"}</span>
          </div>
          <div className="flex">
            <Eye className={"w-8"} />
            <span className={"text-sm"}>{props.userReceivedViewsCount}</span>
            <span className={"text-sm"}>{"閲覧された"}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <User className={"w-8"} />
            <span className={"text-sm"}>{props.userFollowersCount}</span>
            <span className={"text-sm"}>{"フォロワー"}</span>
          </div>
          <div className="flex">
            <Medal className={"w-8"} />
            <span className={"text-sm"}>{props.userAwardsCount}</span>
            <span className={"text-sm"}>{"入賞数"}</span>
          </div>
        </div>
      </div>
      <div className="flex">
        <Award className={"w-8"} />
        <span className={"w-8"}>{"実績・トロフィーはこちら"}</span>
      </div>
      {props.userBiography && (
        <span className={"text-sm"}>{props.userBiography}</span>
      )}
      <div className="flex">
        <SocialTwitterButton />
        <SocialInstagramButton />
        <LinkEmailButton />
        <LinkWebButton />
      </div>
      <UserPickUp />
    </div>
  )
}
