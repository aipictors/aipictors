"use client"

import { SupportMessageList } from "@/app/[lang]/(main)/support/chat/_components/support-message-list"
import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationMessageInput } from "@/app/[lang]/generation/_components/task-view/generation-message-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createMessageMutation } from "@/graphql/mutations/create-message"
import { viewerSupportMessagesQuery } from "@/graphql/queries/viewer/viewer-support-messages"
import { useMutation, useQuery } from "@apollo/client"
import { startTransition } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"

/**
 * 連絡画面
 * @param props
 * @returns
 */
export const GenerationCommunicationView = () => {
  const { data: supportMessages, refetch } = useQuery(
    viewerSupportMessagesQuery,
    {
      variables: {
        limit: 124,
        offset: 0,
      },
    },
  )

  const [createMessage, { loading: isLoading }] = useMutation(
    createMessageMutation,
  )

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 10000)

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
        toast(error.message)
      }
    }
  }

  const adminAvatarURL =
    "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"

  const messages = supportMessages?.viewer?.supportMessages ?? []

  return (
    <GenerationViewCard>
      <ScrollArea className="relative flex flex-col overflow-y-auto p-4">
        <SupportMessageList
          messages={messages}
          recipientIconImageURL={adminAvatarURL}
        />
      </ScrollArea>
      <GenerationMessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </GenerationViewCard>
  )
}
