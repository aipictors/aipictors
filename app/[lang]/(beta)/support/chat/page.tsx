import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"
import dynamic from "next/dynamic"

const DynamicSupportChatView = dynamic(
  () => {
    return import(
      "@/app/[lang]/(beta)/support/chat/_components/dynamic-support-chat-view"
    )
  },
  { ssr: false },
)

const MessagePage = async () => {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <DynamicSupportChatView />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
