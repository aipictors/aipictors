"use client"

import type {
  CreateMessageMutationResult,
  CreateMessageMutationVariables,
  ViewerSupportMessagesQuery,
  ViewerSupportMessagesQueryVariables,
} from "@/__generated__/apollo"
import {
  CreateMessageDocument,
  ViewerSupportMessagesDocument,
} from "@/__generated__/apollo"
import { MessageInput } from "@/app/[lang]/(beta)/support/chat/_components/message-input"
import { SupportMessageList } from "@/app/[lang]/(beta)/support/chat/_components/support-message-list"
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { startTransition } from "react"
import { useInterval } from "usehooks-ts"

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

  const { toast } = useToast()

  const onSubmit = async (message: string) => {
    try {
      await createMessage({
        variables: { input: { text: message, recipientId: "1" } },
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

  const adminAvatarURL =
    "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"

  const messages = supportMessages?.viewer?.supportMessages ?? []

  return (
    <div className="w-full h-full space-y-8 pb-8">
      <div className="h-full flex flex-col-reverse md:flex-col space-y-4">
        <SupportMessageList
          messages={messages}
          recipientIconImageURL={adminAvatarURL}
        />
        <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
