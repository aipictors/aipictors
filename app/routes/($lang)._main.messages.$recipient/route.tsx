import { ParamsError } from "@/_errors/params-error"
import { ChatMessageView } from "@/routes/($lang)._main.messages.$recipient/_components/chat-message-view"
import { useParams } from "@remix-run/react"

/**
 * 受信者とのメッセージ
 */
export default function RecipientMessages() {
  const params = useParams()

  if (params.recipient === undefined) {
    throw new ParamsError()
  }

  return <ChatMessageView recipientId={params.recipient} />
}
