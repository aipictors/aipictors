import type { ViewerSupportMessagesQuery } from "@/_graphql/__generated__/graphql"
import { RecipientMessage } from "@/routes/($lang)._main.support.chat/_components/recipient-message"
import { SenderMessage } from "@/routes/($lang)._main.support.chat/_components/sender-message"

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
      {messages
        .filter((message) => message.isViewer)
        .map((message) => (
          <SenderMessage
            key={`sender-${message.id}`} // Add a unique key prop for SenderMessage
            createdAt={message.createdAt}
            isRead={message.isRead}
            text={message.text ?? "-"}
          />
        ))}
      {messages
        .filter((message) => !message.isViewer)
        .map((message) => (
          <RecipientMessage
            key={`recipient-${message.id}`} // Add a unique key prop for RecipientMessage
            createdAt={message.createdAt}
            iconImageURL={props.recipientIconImageURL}
            text={message.text ?? "-"}
          />
        ))}
    </div>
  )
}
