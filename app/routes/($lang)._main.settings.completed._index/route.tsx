import type {
  MetaFunction,
  LoaderFunctionArgs,
  HeadersFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { SettingsCompleted } from "~/routes/($lang)._main.settings.completed._index/components/settings-completed"

/**
 * 設定完了ページ
 */
export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.COMPLETED_SETTINGS, undefined, props.params.lang)
}

export default function NewSettingsPage() {
  return (
    <>
      <SettingsCompleted />
    </>
  )
}
