"use client"
import { Card, Text, Image, Stack, Avatar, HStack } from "@chakra-ui/react"
import React from "react"

type Props = {
  title?: string
  imageURL: string | null
}

export const CardRanking: React.FC<Props> = (props) => (
  <Card>
    <Image
      src={props.imageURL ?? ""}
      alt={props.title ?? "no title"}
      borderRadius={"lg"}
    />
    <Stack p={2} justifyContent={"space-between"} height={"100%"} spacing={1}>
      <Text fontSize={"sm"} fontWeight={"bold"}>
        {props.title ?? "no title"}
      </Text>
      <HStack spacing={4}>
        <Avatar
          name={"user name"}
          src={"https://bit.ly/dan-abramov"}
          size={"sm"}
        />
        <Text fontSize={"sm"}>{"user name"}</Text>
      </HStack>
    </Stack>
  </Card>
)
