"use client"

import type {
  CreateMessageMutationResult,
  CreateMessageMutationVariables,
  MessageThreadMessagesQuery,
  MessageThreadMessagesQueryVariables,
} from "@/__generated__/apollo"
import {
  CreateMessageDocument,
  MessageThreadMessagesDocument,
} from "@/__generated__/apollo"
import { MessageInput } from "@/app/[lang]/(beta)/support/chat/_components/message-input"
import { SupportMessageList } from "@/app/[lang]/(beta)/support/chat/_components/support-message-list"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { HStack, Stack, useInterval, useToast } from "@chakra-ui/react"
import { startTransition } from "react"

type Props = {
  recipientId: string
}

export const RecipientMessageList = (props: Props) => {
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

  const messages = data?.viewer?.messageThread?.messages ?? []

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"} pb={40}>
      <Stack
        position={"relative"}
        maxW={"800px"}
        w={"100%"}
        marginRight={"auto"}
        p={4}
        spacing={8}
      >
        <Stack flexDirection={{ base: "column-reverse", md: "column" }}>
          <SupportMessageList
            messages={messages}
            recipientIconImageURL={
              data?.viewer?.messageThread?.recipient.iconImage?.downloadURL ??
              ""
            }
          />
          <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
        </Stack>
      </Stack>
    </HStack>
  )
}
