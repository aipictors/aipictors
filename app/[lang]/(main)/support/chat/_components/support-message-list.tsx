import { RecipientMessage } from "@/[lang]/(main)/support/chat/_components/recipient-message"
import { SenderMessage } from "@/[lang]/(main)/support/chat/_components/sender-message"
import type { ViewerSupportMessagesQuery } from "@/_graphql/__generated__/graphql"

import { useEffect, useRef } from "react"

type Props = {
  recipientIconImageURL: string
  messages: NonNullable<ViewerSupportMessagesQuery["viewer"]>["supportMessages"]
}

export const SupportMessageList = (props: Props) => {
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
        // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
        message.isViewer ? (
          <SenderMessage
            key={message.id}
            createdAt={message.createdAt}
            isRead={message.isRead}
            text={message.text ?? "-"}
          />
        ) : (
          <RecipientMessage
            key={message.id}
            text={message.text ?? "-"}
            createdAt={message.createdAt}
            iconImageURL={props.recipientIconImageURL}
          />
        ),
      )}
    </div>
  )
}
