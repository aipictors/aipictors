"use client"

import { Avatar, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { toElapsedTimeText } from "app/_utils/to-elapsed-time-text"

type Props = {
  text: string
  iconImageURL: string
  createdAt: number
}

export const RecipientMessage: React.FC<Props> = (props) => {
  return (
    <HStack spacing={4} alignItems={"flex-start"}>
      <Avatar src={props.iconImageURL} />
      <Stack maxW={"sm"}>
        <Card
          variant={"filled"}
          px={6}
          py={2}
          borderTopRightRadius={"xl"}
          borderTopLeftRadius={"sm"}
          borderBottomRightRadius={"xl"}
          borderBottomLeftRadius={"xl"}
        >
          <Text whiteSpace={"pre-wrap"}>{props.text}</Text>
        </Card>
        <HStack justifyContent={"flex-end"}>
          <Text fontSize={"2xs"}>{toElapsedTimeText(props.createdAt)}</Text>
        </HStack>
      </Stack>
    </HStack>
  )
}
