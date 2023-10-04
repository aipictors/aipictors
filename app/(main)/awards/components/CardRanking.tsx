"use client"
import { Card, Text, Image, Stack, Avatar, HStack } from "@chakra-ui/react"
import React from "react"

type Props = {
  title?: string
  imageURL: string | null
  work: {
    user: {
      name: string
      iconImage: {
        downloadURL: string | null
      } | null
    }
  }
}

export const CardRanking: React.FC<Props> = (props) => (
  <Card>
    <Image
      src={props.imageURL ?? ""}
      alt={props.title ?? "no title"}
      borderRadius={"lg"}
      height={32}
      minH={32}
      objectFit="cover"
    />
    <Stack p={2} justifyContent={"space-between"} height={"100%"} spacing={1}>
      <Text fontSize={"sm"} fontWeight={"bold"}>
        {props.title ?? ""}
      </Text>
      <HStack spacing={2} alignItems={"center"}>
        <Avatar
          name={props.work.user.name}
          src={props.work.user.iconImage?.downloadURL ?? ""}
          size={"xs"}
        />
        <Text fontSize={"xs"}>{props.work.user.name}</Text>
      </HStack>
    </Stack>
  </Card>
)
