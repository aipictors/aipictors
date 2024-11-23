import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
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
  // 設定画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_SETTINGS, undefined, props.params.lang)
}

export default function NewSettingsPage() {
  return <UserSettingsForm />
}
