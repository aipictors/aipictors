import { ChatMessageView } from "@/[lang]/(main)/messages/[recipient]/_components/chat-message-view"
import { ClientParamsError } from "@/errors/client-params-error"
import { useParams } from "@remix-run/react"

/**
 * 受信者とのメッセージ
 */
export default function RecipientMessages() {
  const params = useParams()

  if (params.recipient === undefined) {
    throw new ClientParamsError()
  }

  return <ChatMessageView recipientId={params.recipient} />
}
