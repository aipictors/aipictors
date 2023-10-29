import { RecipientMessageList } from "app/[lang]/(main)/messages/[recipient]/_components/RecipientMessageList"
import type { Metadata } from "next"

type Props = {
  params: {
    recipient: string
  }
}

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
