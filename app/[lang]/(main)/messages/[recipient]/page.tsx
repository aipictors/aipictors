import { RecipientMessageList } from "@/app/[lang]/(main)/messages/[recipient]/_components/recipient-message-list"
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

  return <RecipientMessageList recipientId={recipientId} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RecipientMessagesPage
