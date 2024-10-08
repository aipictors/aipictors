import { MessageInput } from "~/routes/($lang)._main.support.chat/components/message-input"
import {
  MessageListItemFragment,
  MessageThreadRecipientFragment,
  SupportMessageList,
} from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { startTransition } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"

export function SupportChatView() {
  const { data: supportMessages, refetch } = useQuery(MessagesQuery, {
    variables: {
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
    <div className="sticky top-0 flex h-main flex-col">
      <SupportMessageList
        messages={messages}
        recipientIconImageURL={adminAvatarURL}
      />
      <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  )
}

const MessagesQuery = graphql(
  `query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      id
      supportMessages(offset: $offset, limit: $limit) {
        id
        ...MessageListItem
      }
    }
  }`,
  [MessageThreadRecipientFragment, MessageListItemFragment],
)

const createMessageMutation = graphql(
  `mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageListItem
    }
  }`,
  [MessageListItemFragment],
)
