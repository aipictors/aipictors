"use client"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { HStack, Stack, useInterval, useToast } from "@chakra-ui/react"
import { startTransition } from "react"
import type {
  CreateMessageMutationResult,
  CreateMessageMutationVariables,
  MessageThreadMessagesQuery,
  MessageThreadMessagesQueryVariables,
} from "__generated__/apollo"
import {
  CreateMessageDocument,
  MessageThreadMessagesDocument,
} from "__generated__/apollo"
import { MessageInput } from "app/(beta)/support/chat/components/MessageInput"
import { SupportMessageList } from "app/(beta)/support/chat/components/SupportMessageList"

type Props = {
  recipientId: string
}

export const RecipientMessages: React.FC<Props> = (props) => {
  const { data, refetch } = useSuspenseQuery<
    MessageThreadMessagesQuery,
    MessageThreadMessagesQueryVariables
  >(MessageThreadMessagesDocument, {
    variables: {
      threadId: props.recipientId,
      limit: 124,
      offset: 0,
    },
  })

  const [createMessage, { loading: isLoading }] = useMutation<
    CreateMessageMutationResult,
    CreateMessageMutationVariables
  >(CreateMessageDocument)

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

  const toast = useToast()

  const onSubmit = async (message: string) => {
    try {
      await createMessage({
        variables: { input: { text: message, recipientId: props.recipientId } },
      })
      startTransition(() => {
        refetch()
      })
    } catch (error) {
      if (error instanceof Error) {
        toast({ status: "error", description: error.message })
      }
    }
  }

  const adminAvatarURL =
    "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"

  const messages = data?.viewer?.messageThread?.messages ?? []

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"} pb={40}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
        <SupportMessageList
          messages={messages}
          recipientIconImageURL={adminAvatarURL}
        />
      </Stack>
    </HStack>
  )
}
