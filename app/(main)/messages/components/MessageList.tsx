"use client"
import { HStack, Stack } from "@chakra-ui/react"
import { MessageInput } from "app/(main)/messages/components/MessageInput"
import { RecipientMessage } from "app/(main)/messages/components/RecipientMessage"
import { SenderMessage } from "app/(main)/messages/components/SenderMessage"

export const MessageList: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <MessageInput />
        <RecipientMessage />
        <SenderMessage />
      </Stack>
    </HStack>
  )
}
