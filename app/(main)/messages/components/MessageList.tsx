"use client"
import { HStack, Stack } from "@chakra-ui/react"
import { MessageInput } from "app/(main)/messages/components/MessageInput"
import { RecipientMessage } from "app/(main)/messages/components/RecipientMessage"
import { SenderMessage } from "app/(main)/messages/components/SenderMessage"

export const MessageList: React.FC = () => {
  const adminAvatarURL =
    "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <MessageInput />
        <RecipientMessage avatarURL={adminAvatarURL} />
        <SenderMessage />
      </Stack>
    </HStack>
  )
}
