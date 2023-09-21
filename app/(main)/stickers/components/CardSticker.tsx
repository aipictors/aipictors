"use client"
import { Card, Text, Image, Icon, HStack } from "@chakra-ui/react"
import React from "react"
import { TbDownload, TbHeart, TbSticker } from "react-icons/tb"

type Props = {
  title?: string
  imageURL: string | null
  downloadsCount?: number
  likesCount?: number
  usesCount?: number
}

export const CardSticker: React.FC<Props> = (props) => {
  return (
    <Card>
      <Image
        src={props.imageURL ?? ""}
        alt={props.title ?? "no title"}
        borderRadius={"lg"}
      />
      <Text p={2} fontSize={"sm"}>
        {props.title ?? "no title"}
      </Text>
      <HStack>
        <Icon as={TbDownload} />
        <Text fontSize={"sm"}>{props.downloadsCount}</Text>
        <Icon as={TbSticker} />
        <Text fontSize={"sm"}>{props.usesCount}</Text>
        <Icon as={TbHeart} />
        <Text fontSize={"sm"}>{props.likesCount}</Text>
      </HStack>
    </Card>
  )
}
