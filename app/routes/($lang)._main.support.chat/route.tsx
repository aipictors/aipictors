import type { MetaFunction } from "@remix-run/cloudflare"
import { AppPageCenter } from "~/components/app/app-page-center"
import { META } from "~/config"
import { SupportChatView } from "~/routes/($lang)._main.support.chat/components/dynamic-support-chat-view"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SUPPORT_CHAT)
}

export default function SupportChat() {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <SupportChatView />
    </AppPageCenter>
  )
}
