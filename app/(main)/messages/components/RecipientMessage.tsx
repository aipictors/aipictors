"use client"
import { Avatar, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { toElapsedTimeText } from "app/utils/toElapsedTimeText"

type Props = {
  avatarURL: string
}

export const RecipientMessage: React.FC<Props> = (props) => {
  return (
    <HStack spacing={4} alignItems={"flex-start"}>
      <Avatar bg={"teal.500"} src={props.avatarURL} />
      <Stack>
        <Card
          px={6}
          py={2}
          borderRightRadius={"full"}
          borderBottomLeftRadius={"full"}
        >
          <Text> {"Hello!"}</Text>
        </Card>
        <HStack justifyContent={"end"}>
          <Text fontSize={"2xs"}>{toElapsedTimeText(1696685478)}</Text>
        </HStack>
      </Stack>
    </HStack>
  )
}
