import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { NewProfileEditorForm } from "~/routes/($lang)._main.new.profile._index/components/new-profile-editor-form"

/**
 * プロフィール新規作成ページ
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  // 設定画面なのでキャッシュは不要
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_PROFILE, undefined, props.params.lang)
}

export default function NewProfilePage () {
  return <NewProfileEditorForm />
}
