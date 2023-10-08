import { Stack } from "@chakra-ui/react"
import type { ViewerSupportMessagesQuery } from "__generated__/apollo"
import { RecipientMessage } from "app/(beta)/support/chat/components/RecipientMessage"
import { SenderMessage } from "app/(beta)/support/chat/components/SenderMessage"

type Props = {
  recipientIconImageURL: string
  messages: NonNullable<ViewerSupportMessagesQuery["viewer"]>["supportMessages"]
}

export const SupportMessageList: React.FC<Props> = (props) => {
  return (
    <Stack spacing={4}>
      {props.messages.map((message) =>
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
