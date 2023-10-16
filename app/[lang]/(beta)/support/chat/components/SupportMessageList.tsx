import { Stack } from "@chakra-ui/react"
import type { ViewerSupportMessagesQuery } from "__generated__/apollo"
import { RecipientMessage } from "app/[lang]/(beta)/support/chat/components/RecipientMessage"
import { SenderMessage } from "app/[lang]/(beta)/support/chat/components/SenderMessage"
import { useEffect, useRef, useState } from "react"

type Props = {
  recipientIconImageURL: string
  messages: NonNullable<ViewerSupportMessagesQuery["viewer"]>["supportMessages"]
}

export const SupportMessageList: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 800)

  useEffect(() => {
    // 読み込まれた後にスクロール位置を一番下に設定
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: isMobileView ? 0 : containerRef.current.scrollHeight,
      })
    }

    const handleResize = () => {
      console.log(isMobileView)
      setIsMobileView(window.innerWidth <= 800)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
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
        .sort((a, b) => {
          if (isMobileView) {
            return b.createdAt - a.createdAt
          } else {
            return a.createdAt - b.createdAt
          }
        })
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
