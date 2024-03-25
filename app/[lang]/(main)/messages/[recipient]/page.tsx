import { ChatMessageView } from "@/app/[lang]/(main)/messages/[recipient]/_components/chat-message-view"
import type { Metadata } from "next"

type Props = {
  params: {
    recipient: string
  }
}

/**
 * 受信者とのメッセージ
 * @param props
 * @returns
 */
const RecipientMessagesPage = async (props: Props) => {
  const recipientId = props.params.recipient

  return <ChatMessageView recipientId={recipientId} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default RecipientMessagesPage
