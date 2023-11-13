import type { ViewerSupportMessagesQuery } from "@/__generated__/apollo"
import { RecipientMessage } from "@/app/[lang]/(beta)/support/chat/_components/recipient-message"
import { SenderMessage } from "@/app/[lang]/(beta)/support/chat/_components/sender-message"
import { Stack } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"

type Props = {
  recipientIconImageURL: string
  messages: NonNullable<ViewerSupportMessagesQuery["viewer"]>["supportMessages"]
}

export const SupportMessageList: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: isMobileView ? 0 : containerRef.current.scrollHeight,
      })
    }

    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768)
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
    </Stack>
  )
}
