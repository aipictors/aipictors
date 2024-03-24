import { SupportChatView } from "@/app/[lang]/(main)/support/chat/_components/dynamic-support-chat-view"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const MessagePage = async () => {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <SupportChatView />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
