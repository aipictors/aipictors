import { ParamsError } from "~/errors/params-error"
import { ChatMessageView } from "~/routes/($lang)._main.messages.$recipient/components/chat-message-view"
import { useParams } from "react-router"

/**
 * 受信者とのメッセージ
 */
export default function RecipientMessages() {
  const params = useParams()

  if (params.recipient === undefined) {
    throw ParamsError()
  }

  return <ChatMessageView recipientId={params.recipient} />
}
