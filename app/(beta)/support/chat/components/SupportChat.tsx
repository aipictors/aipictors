"use client"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { Stack, useInterval, useToast } from "@chakra-ui/react"
import { startTransition } from "react"
import type {
  CreateMessageMutationResult,
  CreateMessageMutationVariables,
  ViewerSupportMessagesQuery,
  ViewerSupportMessagesQueryVariables,
} from "__generated__/apollo"
import {
  CreateMessageDocument,
  ViewerSupportMessagesDocument,
} from "__generated__/apollo"
import { MessageInput } from "app/(beta)/support/chat/components/MessageInput"
import { SupportMessageList } from "app/(beta)/support/chat/components/SupportMessageList"

export const SupportChat: React.FC = () => {
  const { data: supportMessages, refetch } = useSuspenseQuery<
    ViewerSupportMessagesQuery,
    ViewerSupportMessagesQueryVariables
  >(ViewerSupportMessagesDocument, {
    variables: {
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
      console.log(message)
      await createMessage({
        variables: { input: { text: message, recipientId: "1" } },
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

  const messages = supportMessages?.viewer?.supportMessages ?? []

  return (
    <Stack w={"100%"} spacing={8} pb={16}>
      <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
      <SupportMessageList
        messages={messages}
        recipientIconImageURL={adminAvatarURL}
      />
    </Stack>
  )
}
