"use client"
import { Card, HStack, Icon, Image, Stack, Text } from "@chakra-ui/react"
import React from "react"
import { TbDownload, TbRubberStamp } from "react-icons/tb"

type Props = {
  title?: string
  imageURL: string | null
  downloadsCount?: number
  usesCount?: number
}

export const StickerCard: React.FC<Props> = (props) => {
  return (
    <>
      <Card>
        <Image
          src={props.imageURL ?? ""}
          alt={props.title ?? "no title"}
          borderRadius={"lg"}
        />
        <Stack
          p={2}
          justifyContent={"space-between"}
          height={"100%"}
          spacing={1}
        >
          <Text fontSize={"sm"} fontWeight={"bold"}>
            {props.title ?? "no title"}
          </Text>
          <HStack alignItems={"center"} spacing={4}>
            <HStack>
              <Icon as={TbDownload} />
              <Text fontSize={"sm"}>{props.downloadsCount}</Text>
            </HStack>
            <HStack>
              <Icon as={TbRubberStamp} />
              <Text fontSize={"sm"}>{props.usesCount}</Text>
            </HStack>
          </HStack>
        </Stack>
      </Card>
    </>
  )
}
