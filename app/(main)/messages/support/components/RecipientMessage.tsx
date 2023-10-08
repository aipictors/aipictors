"use client"
import { Avatar, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { toElapsedTimeText } from "app/utils/toElapsedTimeText"

type Props = {
  text: string
  iconImageURL: string
  createdAt: number
}

export const RecipientMessage: React.FC<Props> = (props) => {
  return (
    <HStack spacing={4} alignItems={"flex-start"}>
      <Avatar src={props.iconImageURL} />
      <Stack>
        <Card
          variant={"filled"}
          px={6}
          py={2}
          borderRightRadius={"full"}
          borderBottomLeftRadius={"full"}
        >
          <Text>{props.text}</Text>
        </Card>
        <HStack justifyContent={"end"}>
          <Text fontSize={"2xs"}>{toElapsedTimeText(props.createdAt)}</Text>
        </HStack>
      </Stack>
    </HStack>
  )
}
