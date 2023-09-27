"use client"
import { Stack, Avatar, Text, HStack, Icon } from "@chakra-ui/react"
import React from "react"
import { TbHeartFilled, TbEye, TbUser, TbMedal2, TbAward } from "react-icons/tb"
import { UserWorkList } from "app/(main)/users/[user]/components/UserWorkList"
import { DotButton } from "app/components/DotButton"
import { FollowButton } from "app/components/FollowButton"
import { LinkEmailButton } from "app/components/LinkEmailButton"
import { LinkWebButton } from "app/components/LinkWebButton"
import { ShareButton } from "app/components/ShareButton"
import { SocialInstagramButton } from "app/components/SocialInstagramButton"
import { SocialTwitterButton } from "app/components/SocialTwitterButton"

export const UserProfile: React.FC = () => (
  <Stack>
    <Avatar />
    <HStack>
      <Text fontWeight={"bold"} fontSize={"lg"}>
        {"名前"}
      </Text>
      <FollowButton />
      <ShareButton />
      <DotButton />
    </HStack>
    <HStack>
      <Stack>
        <HStack>
          <Icon as={TbHeartFilled} fontSize={"sm"} />
          <Text fontSize={"sm"}>{"いいねされた"}</Text>
        </HStack>
        <HStack>
          <Icon as={TbEye} fontSize={"sm"} />
          <Text fontSize={"sm"}>{"閲覧された"}</Text>
        </HStack>
      </Stack>
      <Stack>
        <HStack>
          <Icon as={TbUser} fontSize={"sm"} />
          <Text fontSize={"sm"}>{"フォロワー"}</Text>
        </HStack>
        <HStack>
          <Icon as={TbMedal2} fontSize={"sm"} />
          <Text fontSize={"sm"}>{"入賞数"}</Text>
        </HStack>
      </Stack>
    </HStack>
    <HStack>
      <Icon as={TbAward} fontSize={"sm"} />
      <Text fontSize={"sm"}>{"実績・トロフィーはこちら"}</Text>
    </HStack>
    <Text fontSize={"sm"}>{"紹介文"}</Text>
    <HStack>
      <SocialTwitterButton />
      <SocialInstagramButton />
      <LinkEmailButton />
      <LinkWebButton />
    </HStack>
    <UserWorkList />
  </Stack>
)
