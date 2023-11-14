"use client"

import { Avatar, HStack, Text } from "@chakra-ui/react"

type Props = {
  userName: string
  userIconImageURL: string | null
}

export const UserAvatarLink = (props: Props) => (
  <HStack spacing={2} alignItems={"center"}>
    <Avatar
      name={props.userName}
      src={props.userIconImageURL ?? ""}
      size={"xs"}
    />
    <Text fontSize={"xs"}>{props.userName}</Text>
  </HStack>
)
