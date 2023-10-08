import type { Metadata } from "next"
import { SupportChat } from "app/(beta)/support/chat/components/SupportChat"

const MessagePage = async () => {
  return <SupportChat />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
