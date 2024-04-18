import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { createMessageMutation } from "@/_graphql/mutations/create-message"
import { ChatMessageListContent } from "@/routes/($lang)._main.messages.$recipient/_components/chat-message-list-content"
import { MessageInput } from "@/routes/($lang)._main.support.chat/_components/message-input"
import { useMutation } from "@apollo/client/index.js"
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
