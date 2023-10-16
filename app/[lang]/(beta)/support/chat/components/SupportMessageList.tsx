import { Stack } from "@chakra-ui/react"
import type { ViewerSupportMessagesQuery } from "__generated__/apollo"
import { RecipientMessage } from "app/[lang]/(beta)/support/chat/components/RecipientMessage"
import { SenderMessage } from "app/[lang]/(beta)/support/chat/components/SenderMessage"
import { useEffect, useRef } from "react"

type Props = {
  recipientIconImageURL: string
  messages: NonNullable<ViewerSupportMessagesQuery["viewer"]>["supportMessages"]
}

export const SupportMessageList: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 読み込まれた後にスクロール位置を一番下に設定
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
      })
    }
  }, [props.messages])

  return (
    <Stack
      spacing={4}
      height={"calc(80vh - 40px)"}
      overflowX="auto"
      ref={containerRef}
    >
      {props.messages
        .slice()
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((message) =>
          message.isViewer ? (
            <SenderMessage
              key={message.id}
              createdAt={message.createdAt}
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
    </Stack>
  )
}
