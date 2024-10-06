import { json } from "react-router"
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { SettingsCompleted } from "~/routes/($lang)._main.settings.completed._index/components/settings-completed"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

/**
 * 設定完了ページ
 */
export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return json({})
}

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
