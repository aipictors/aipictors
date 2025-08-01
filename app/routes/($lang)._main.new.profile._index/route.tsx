import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { ProfileEditorForm } from "~/routes/($lang)._main.new.profile._index/components/profile-editor-form"

/**
 * プロフィール新規作成ページ
 */
export async function loader(_props: LoaderFunctionArgs) {
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
  return createMeta(META.NEW_PROFILE, undefined, props.params.lang)
}

export default function NewProfilePage() {
  return <ProfileEditorForm />
}
