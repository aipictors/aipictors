"use client"
import { Text, Avatar, HStack } from "@chakra-ui/react"
import React from "react"

type Props = {
  userName: string
  userIconImageURL: string | null
}

export const UserAvatarLink: React.FC<Props> = (props) => (
  <HStack spacing={2} alignItems={"center"}>
    <Avatar
      name={props.userName}
      src={props.userIconImageURL ?? ""}
      size={"xs"}
    />
    <Text fontSize={"xs"}>{props.userName}</Text>
  </HStack>
)
