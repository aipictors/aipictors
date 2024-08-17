import {
  RecipientMessage,
  RecipientMessageFragment,
} from "~/routes/($lang)._main.support.chat/components/recipient-message"
import {
  SenderMessage,
  SenderMessageFragment,
} from "~/routes/($lang)._main.support.chat/components/sender-message"
import { graphql, type FragmentOf } from "gql.tada"
import { useEffect, useRef } from "react"

type Props = {
  messages: FragmentOf<typeof MessageListItemFragment>[]
  recipientIconImageURL: string
}

export function SupportMessageList(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current === null) return
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
    })
  }, [props.messages.length])

  const messages = props.messages
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)

  return (
    <div
      className="mb-16 h-full max-h-[50vh] flex-1 space-y-4 overflow-x-auto md:max-h-[100%]"
      ref={containerRef}
    >
      {messages.map((message) =>
        message.isViewer ? (
          <SenderMessage key={message.id} message={message} />
        ) : (
          <RecipientMessage
            key={message.id}
            message={message}
            recipientIconImageURL={props.recipientIconImageURL}
          />
        ),
      )}
    </div>
  )
}

export const MessageThreadRecipientFragment = graphql(
  `fragment MessageThreadRecipient on UserNode @_unmask {
    id
    iconUrl
  }`,
)

export const MessageListItemFragment = graphql(
  `fragment MessageListItem on MessageNode @_unmask {
    id
    isViewer
    ...SenderMessage
    ...RecipientMessage
  }`,
  [SenderMessageFragment, RecipientMessageFragment],
)
