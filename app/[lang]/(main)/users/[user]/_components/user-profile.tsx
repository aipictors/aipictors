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
import { Avatar, HStack, Link as ChakraLink, Text } from "@chakra-ui/react"
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
      <Avatar
        name={props.userName}
        src={props.userIconImageURL ?? ""}
        size={"lg"}
      />
      <div className="flex">
        <span className="font-bold text-lg">{props.userName}</span>
        <FollowButton />
        <ShareButton />
        <UserMuteMenu />
      </div>
      <HStack>
        <div className="flex flex-col">
          <div className="flex">
            <Heart fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userReceivedLikesCount}</Text>
            <Text fontSize={"sm"}>{"いいねされた"}</Text>
          </div>
          <div className="flex">
            <Eye fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userReceivedViewsCount}</Text>
            <Text fontSize={"sm"}>{"閲覧された"}</Text>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <User fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userFollowersCount}</Text>
            <Text fontSize={"sm"}>{"フォロワー"}</Text>
          </div>
          <div className="flex">
            <Medal fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userAwardsCount}</Text>
            <Text fontSize={"sm"}>{"入賞数"}</Text>
          </div>
        </div>
      </HStack>
      <div className="flex">
        <Award fontSize={"sm"} />
        <ChakraLink fontSize={"sm"}>{"実績・トロフィーはこちら"}</ChakraLink>
      </div>
      {props.userBiography && (
        <Text fontSize={"sm"}>{props.userBiography}</Text>
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
