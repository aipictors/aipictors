"use client"

import { MessageInput } from "@/app/[lang]/(beta)/support/chat/_components/message-input"
import { SupportMessageList } from "@/app/[lang]/(beta)/support/chat/_components/support-message-list"
import type {
  CreateMessageMutation,
  CreateMessageMutationVariables,
  MessageThreadMessagesQuery,
  MessageThreadMessagesQueryVariables,
} from "@/graphql/__generated__/graphql"
import { createMessageMutation } from "@/graphql/mutations/create-message"
import { messageThreadMessagesQuery } from "@/graphql/queries/message/message-thread-messages"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { startTransition } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"

type Props = {
  recipientId: string
}

export const RecipientMessageList = (props: Props) => {
  const { data, refetch } = useSuspenseQuery(messageThreadMessagesQuery, {
    variables: {
      threadId: props.recipientId,
      limit: 124,
      offset: 0,
    },
  })

  const [createMessage, { loading: isLoading }] = useMutation(
    createMessageMutation,
  )

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

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
        toast(error.message)
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
