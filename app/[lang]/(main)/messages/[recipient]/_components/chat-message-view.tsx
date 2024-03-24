"use client"

import { ChatMessageListContent } from "@/app/[lang]/(main)/messages/[recipient]/_components/chat-message-list-content"
import { MessageInput } from "@/app/[lang]/(main)/support/chat/_components/message-input"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { createMessageMutation } from "@/graphql/mutations/create-message"
import { useMutation } from "@apollo/client"
import { Suspense } from "react"
import { toast } from "sonner"

type Props = {
  recipientId: string
}

/**
 * @param props
 * @returns
 */
export function ChatMessageView(props: Props) {
  const [createMessage, { loading: isLoading }] = useMutation(
    createMessageMutation,
  )

  const onSubmit = async (message: string) => {
    try {
      await createMessage({
        variables: { input: { text: message, recipientId: props.recipientId } },
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <div className="sticky top-0 flex h-main w-full flex-col-reverse overflow-y-hidden pt-2 md:flex-col">
      <Suspense fallback={<AppLoadingPage />}>
        <ChatMessageListContent recipientId={props.recipientId} />
      </Suspense>
      <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  )
}
