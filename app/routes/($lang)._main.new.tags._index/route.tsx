import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { META } from "~/config"
import { NewFollowTagsForm } from "~/routes/($lang)._main.new.tags._index/components/new-follow-tags-form"
import { createMeta } from "~/utils/create-meta"

/**
 * 登録の最後の手順: 好きなタグを選ぶ
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  // 設定画面なのでキャッシュは不要
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_TAGS, undefined, props.params.lang)
}

export default function NewTagsPage() {
  return <NewFollowTagsForm />
}
