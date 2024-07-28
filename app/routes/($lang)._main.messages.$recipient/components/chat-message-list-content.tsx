import { IconUrl } from "~/components/icon-url"
import { messageFieldsFragment } from "~/graphql/fragments/message-fields"
import { messageThreadFieldsFragment } from "~/graphql/fragments/message-thread-fields"
import { SupportMessageList } from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { startTransition } from "react"
import { useInterval } from "usehooks-ts"

type Props = {
  recipientId: string
}

/**
 */
export function ChatMessageListContent(props: Props) {
  const { data, refetch } = useSuspenseQuery(messageThreadMessagesQuery, {
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

  const messages = data?.viewer?.messageThread?.messages ?? []

  return (
    <SupportMessageList
      messages={messages}
      recipientIconImageURL={IconUrl(
        data?.viewer?.messageThread?.recipient.iconUrl,
      )}
    />
  )
}

const messageThreadMessagesQuery = graphql(
  `query MessageThreadMessages($threadId: ID!, $offset: Int!, $limit: Int!) {
    viewer {
      id
      messageThread(threadId: $threadId) {
        id
        ...MessageThreadFields
        messages(offset: $offset, limit: $limit) {
          ...MessageFields
        }
      }
    }
  }`,
  [messageThreadFieldsFragment, messageFieldsFragment],
)
