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
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { startTransition } from "react"
import { useInterval } from "usehooks-ts"

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

  const { toast } = useToast()

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
        toast({ description: error.message })
      }
    }
  }

  const messages = data?.viewer?.messageThread?.messages ?? []

  return (
    <div className="w-full sticky top-0 overflow-y-hidden h-main flex flex-col-reverse md:flex-col pt-2">
      <SupportMessageList
        messages={messages}
        recipientIconImageURL={
          data?.viewer?.messageThread?.recipient.iconImage?.downloadURL ?? ""
        }
      />
      <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  )
}
