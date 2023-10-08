import type { Metadata } from "next"
import { ViewerSupportMessagesMain } from "app/(main)/messages/support/components/SupportMessagesMain"

const MessagePage = async () => {
  return <ViewerSupportMessagesMain />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
