import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { UserSettingsForm } from "~/routes/($lang)._main.new.settings._index/components/user-settings-form"

/**
 * ユーザ設定新規作成ページ
 */
export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_SETTINGS, undefined, props.params.lang)
}

export default function NewSettingsPage() {
  return <UserSettingsForm />
}
