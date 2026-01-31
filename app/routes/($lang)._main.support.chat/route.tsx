import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { AppPageCenter } from "~/components/app/app-page-center"
import { config, META } from "~/config"
import { SupportChatView } from "~/routes/($lang)._main.support.chat/components/dynamic-support-chat-view"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SUPPORT_CHAT, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

export default function SupportChat () {
  return (
    <AppPageCenter className="pt-0 pb-0">
      <SupportChatView />
    </AppPageCenter>
  )
}
