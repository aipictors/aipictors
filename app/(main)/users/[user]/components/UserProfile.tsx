"use client"
import {
  Stack,
  Avatar,
  Text,
  HStack,
  Button,
  IconButton,
  Icon,
} from "@chakra-ui/react"
import React from "react"
import {
  TbShare2,
  TbHeartFilled,
  TbEye,
  TbUser,
  TbMedal2,
  TbAward,
  TbDots,
} from "react-icons/tb"

export const UserProfile: React.FC = () => (
  <Stack>
    <Avatar />
    <HStack>
      <Text fontWeight={"bold"} fontSize={"lg"}>
        {"名前"}
      </Text>
      <Button colorScheme="primary" borderRadius={"full"} size={"sm"}>
        {"フォローする"}
      </Button>
      <IconButton aria-label="share" icon={<TbShare2 />} size={"sm"} />
      <IconButton aria-label="menu" icon={<TbDots />} size={"sm"} />
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
      <Button borderRadius={"full"} size={"sm"}>
        {"ツイッター"}
      </Button>
      <Button borderRadius={"full"} size={"sm"}>
        {"インスタ"}
      </Button>
    </HStack>
  </Stack>
)
