"use client"

import { Card, HStack, Image, Link, Stack, Text } from "@chakra-ui/react"
import { Download, Stamp } from "lucide-react"

type Props = {
  id: string
  title?: string
  imageURL: string | null
  downloadsCount?: number
  usesCount?: number
}

export const StickerCard = (props: Props) => {
  return (
    <>
      <Card>
        <Link href={`https://www.aipictors.com/stamp/?id=${props.id}`}>
          <Image
            src={props.imageURL ?? ""}
            alt={props.title ?? "no title"}
            borderRadius={"lg"}
          />
        </Link>
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
              <Download />
              <Text fontSize={"sm"}>{props.downloadsCount}</Text>
            </HStack>
            <HStack>
              <Stamp />
              <Text fontSize={"sm"}>{props.usesCount}</Text>
            </HStack>
          </HStack>
        </Stack>
      </Card>
    </>
  )
}
