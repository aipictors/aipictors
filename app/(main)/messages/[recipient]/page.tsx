import type { Metadata } from "next"
import { RecipientMessages } from "app/(main)/messages/[recipient]/components/RecipientMessages"

type Props = {
  params: {
    recipient: string
  }
}

const RecipientMessagesPage = async (props: Props) => {
  const recipientId = props.params.recipient

  return <RecipientMessages recipientId={recipientId} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RecipientMessagesPage
