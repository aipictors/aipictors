import {
  MessageListItemFragment,
  MessageThreadRecipientFragment,
} from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { startTransition } from "react"
import { useInterval } from "usehooks-ts"
import { ChatMessageList } from "~/routes/($lang)._main.support.chat/components/chat-message-list"

type Props = {
  recipientId: string
}

/**
 */
export function ChatMessageListContent (props: Props) {
  const { data, refetch } = useSuspenseQuery(MessagesQuery, {
    variables: {
      threadId: props.recipientId,
      limit: 124,
      offset: 0,
    },
  })

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

  if (data.viewer === null || data.viewer.messageThread === null) {
    return null
  }

  return (
    <ChatMessageList
      messages={data.viewer.messageThread.messages}
      recipient={data.viewer.messageThread.recipient}
    />
  )
}

const MessagesQuery = graphql(
  `query ChatMessageList($threadId: ID!, $offset: Int!, $limit: Int!) {
    viewer {
      id
      messageThread(threadId: $threadId) {
        id
        recipient {
          ...MessageThreadRecipient
        }
        messages(offset: $offset, limit: $limit) {
          id
          ...MessageListItem
        }
      }
    }
  }`,
  [MessageThreadRecipientFragment, MessageListItemFragment],
)
