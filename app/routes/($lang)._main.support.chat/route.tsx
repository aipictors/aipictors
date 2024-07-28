import { AppPageCenter } from "@/components/app/app-page-center"
import { SupportChatView } from "@/routes/($lang)._main.support.chat/components/dynamic-support-chat-view"

export default function SupportChat() {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <SupportChatView />
    </AppPageCenter>
  )
}
