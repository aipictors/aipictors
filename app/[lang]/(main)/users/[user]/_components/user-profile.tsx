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
import {
  Avatar,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react"

import { TbAward, TbEye, TbHeartFilled, TbMedal2, TbUser } from "react-icons/tb"

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
    <Stack>
      <Avatar
        name={props.userName}
        src={props.userIconImageURL ?? ""}
        size={"lg"}
      />
      <HStack>
        <Text fontWeight={"bold"} fontSize={"lg"}>
          {props.userName}
        </Text>
        <FollowButton />
        <ShareButton />
        <UserMuteMenu />
      </HStack>
      <HStack>
        <Stack>
          <HStack>
            <Icon as={TbHeartFilled} fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userReceivedLikesCount}</Text>
            <Text fontSize={"sm"}>{"いいねされた"}</Text>
          </HStack>
          <HStack>
            <Icon as={TbEye} fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userReceivedViewsCount}</Text>
            <Text fontSize={"sm"}>{"閲覧された"}</Text>
          </HStack>
        </Stack>
        <Stack>
          <HStack>
            <Icon as={TbUser} fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userFollowersCount}</Text>
            <Text fontSize={"sm"}>{"フォロワー"}</Text>
          </HStack>
          <HStack>
            <Icon as={TbMedal2} fontSize={"sm"} />
            <Text fontSize={"sm"}>{props.userAwardsCount}</Text>
            <Text fontSize={"sm"}>{"入賞数"}</Text>
          </HStack>
        </Stack>
      </HStack>
      <HStack>
        <Icon as={TbAward} fontSize={"sm"} />
        <ChakraLink fontSize={"sm"}>{"実績・トロフィーはこちら"}</ChakraLink>
      </HStack>
      {props.userBiography && (
        <Text fontSize={"sm"}>{props.userBiography}</Text>
      )}
      <HStack>
        <SocialTwitterButton />
        <SocialInstagramButton />
        <LinkEmailButton />
        <LinkWebButton />
      </HStack>
      <UserPickUp />
    </Stack>
  )
}
