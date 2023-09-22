import type { Metadata } from "next"
import { MessageList } from "app/(main)/messages/components/MessageList"

const MessagePage = async () => {
  return <MessageList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
