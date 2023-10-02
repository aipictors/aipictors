"use client"
import { Stack, Avatar, Text, HStack, Icon } from "@chakra-ui/react"
import React from "react"
import { TbHeartFilled, TbEye, TbUser, TbMedal2, TbAward } from "react-icons/tb"
import type { UserQuery } from "__generated__/apollo"
import { UserPickUp } from "app/(main)/users/[user]/components/UserPickUp"
import { DotButton } from "app/components/DotButton"
import { FollowButton } from "app/components/FollowButton"
import { LinkEmailButton } from "app/components/LinkEmailButton"
import { LinkWebButton } from "app/components/LinkWebButton"
import { ShareButton } from "app/components/ShareButton"
import { SocialInstagramButton } from "app/components/SocialInstagramButton"
import { SocialTwitterButton } from "app/components/SocialTwitterButton"

type Props = {
  user: NonNullable<UserQuery["user"]>
}

export const UserProfile: React.FC<Props> = (props) => (
  <Stack>
    <Avatar
      name="props.user.name"
      src={props.user.iconImage?.downloadURL ?? ""}
    />
    <HStack>
      <Text fontWeight={"bold"} fontSize={"lg"}>
        {props.user.name}
      </Text>
      <FollowButton />
      <ShareButton />
      <DotButton />
    </HStack>
    <HStack>
      <Stack>
        <HStack>
          <Icon as={TbHeartFilled} fontSize={"sm"} />
          <Text fontSize={"sm"}>{props.user.receivedLikesCount}</Text>
          <Text fontSize={"sm"}>{"いいねされた"}</Text>
        </HStack>
        <HStack>
          <Icon as={TbEye} fontSize={"sm"} />
          <Text fontSize={"sm"}>{props.user.receivedViewsCount}</Text>
          <Text fontSize={"sm"}>{"閲覧された"}</Text>
        </HStack>
      </Stack>
      <Stack>
        <HStack>
          <Icon as={TbUser} fontSize={"sm"} />
          <Text fontSize={"sm"}>{props.user.followersCount}</Text>
          <Text fontSize={"sm"}>{"フォロワー"}</Text>
        </HStack>
        <HStack>
          <Icon as={TbMedal2} fontSize={"sm"} />
          <Text fontSize={"sm"}>{props.user.awardsCount}</Text>
          <Text fontSize={"sm"}>{"入賞数"}</Text>
        </HStack>
      </Stack>
    </HStack>
    <HStack>
      <Icon as={TbAward} fontSize={"sm"} />
      <Text fontSize={"sm"}>{"実績・トロフィーはこちら"}</Text>
    </HStack>
    <Text fontSize={"sm"}>{props.user.biography}</Text>
    <HStack>
      <SocialTwitterButton />
      <SocialInstagramButton />
      <LinkEmailButton />
      <LinkWebButton />
    </HStack>
    <UserPickUp />
  </Stack>
)
