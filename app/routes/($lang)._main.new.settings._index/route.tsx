import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { NewUserSettingsForm } from "~/routes/($lang)._main.new.settings._index/components/new-user-settings-form"

/**
 * ユーザ設定新規作成ページ
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  // 設定画面なのでキャッシュは不要
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_SETTINGS, undefined, props.params.lang)
}

export default function NewSettingsPage () {
  return <NewUserSettingsForm />
}
