import { ScrollArea } from "@/_components/ui/scroll-area"
import { createMessageMutation } from "@/_graphql/mutations/create-message"
import { viewerSupportMessagesQuery } from "@/_graphql/queries/viewer/viewer-support-messages"
import { SupportMessageList } from "@/routes/($lang)._main.support.chat/_components/support-message-list"
import { GenerationViewCard } from "@/routes/($lang).generation._index/_components/generation-view-card"
import { GenerationMessageInput } from "@/routes/($lang).generation._index/_components/task-view/generation-message-input"
import { useMutation, useQuery } from "@apollo/client/index"
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
      <ScrollArea
        type="always"
        className="relative flex flex-col overflow-y-auto p-4"
      >
        <SupportMessageList
          messages={messages}
          recipientIconImageURL={adminAvatarURL}
        />
      </ScrollArea>
      <GenerationMessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </GenerationViewCard>
  )
}
