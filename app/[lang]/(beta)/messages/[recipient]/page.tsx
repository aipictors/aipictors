import type { Metadata } from "next"
import dynamic from "next/dynamic"

const DynamicMessageView = dynamic(
  () =>
    import(
      "@/app/[lang]/(beta)/messages/[recipient]/_components/dynamic-message-view"
    ),
  { ssr: false },
)

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

  return <DynamicMessageView recipientId={recipientId} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RecipientMessagesPage
