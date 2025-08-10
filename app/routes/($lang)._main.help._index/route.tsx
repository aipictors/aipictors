import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { HelpArticle } from "~/routes/($lang)._main.help._index/components/help-article"

/**
 * ヘルプページ
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.HELP, undefined, props.params.lang)
}

export default function HelpPage() {
  return <HelpArticle />
}
