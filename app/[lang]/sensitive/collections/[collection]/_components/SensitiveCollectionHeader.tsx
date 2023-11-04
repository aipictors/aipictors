"use client"

import {
  Avatar,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FollowButton } from "app/_components/buttons/FollowButton"
import { TbFlag } from "react-icons/tb"

export const SensitiveCollectionHeader: React.FC = () => {
  return (
    <Stack>
      <Image
        src={"https://source.unsplash.com/random/800x600"}
        alt={"コレクションの画像"}
        borderRadius={"md"}
      />
      <HStack justifyContent={"space-between"}>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          {"コレクション名"}
        </Text>
        <FollowButton />
      </HStack>
      <HStack>
        <Avatar size={"sm"} />
        <Text>{"ユーザー名"}</Text>
      </HStack>
      <Text>{"コレクションの説明"}</Text>
      <HStack>
        <Text>{"12個の作品"}</Text>
        <IconButton
          aria-label="report"
          icon={<Icon as={TbFlag} fontSize={"lg"} />}
          borderRadius={"full"}
        />
      </HStack>
      <Text fontSize={"xs"}>{"＃銅像"}</Text>
    </Stack>
  )
}
