import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { AppPageCenter } from "~/components/app/app-page-center"
import { META } from "~/config"
import { SupportChatView } from "~/routes/($lang)._main.support.chat/components/dynamic-support-chat-view"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SUPPORT_CHAT, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function SupportChat() {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <SupportChatView />
    </AppPageCenter>
  )
}
