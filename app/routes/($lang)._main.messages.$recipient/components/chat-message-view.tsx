import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ChatMessageListContent } from "~/routes/($lang)._main.messages.$recipient/components/chat-message-list-content"
import { MessageInput } from "~/routes/($lang)._main.support.chat/components/message-input"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Suspense } from "react"
import { toast } from "sonner"
import { MessageListItemFragment } from "~/routes/($lang)._main.support.chat/components/chat-message-list"

type Props = {
  recipientId: string
}

/**
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

const createMessageMutation = graphql(
  `mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      ...MessageListItem
    }
  }`,
  [MessageListItemFragment],
)
