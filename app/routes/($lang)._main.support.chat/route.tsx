import { SupportChatView } from "@/[lang]/(main)/support/chat/_components/dynamic-support-chat-view"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

export default function SupportChat() {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <SupportChatView />
    </AppPageCenter>
  )
}
