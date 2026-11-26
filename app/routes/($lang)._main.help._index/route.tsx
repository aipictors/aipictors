import {
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/cloudflare"
import { META } from "~/config"
import { HelpArticle } from "~/routes/($lang)._main.help._index/components/help-article"
import { LEGACY_TAB_TO_SECTION } from "~/routes/($lang)._main.help._index/components/help-sections"
import { createMeta } from "~/utils/create-meta"
import { buildLocalePath } from "~/utils/locale-path"

/**
 * ヘルプページ（使い方ガイドの入口）
 * 以前のタブの URL（/help?tab=coins）は章のページ（/help/coins）へ 301
 */
export async function loader(props: LoaderFunctionArgs) {
  const tab = new URL(props.request.url).searchParams.get("tab")
  if (tab !== null) {
    const id = LEGACY_TAB_TO_SECTION[tab]
    const path =
      id === undefined ? "/help" : id === "faq" ? "/help/faq" : `/help/${id}`
    return redirect(
      buildLocalePath(props.params.lang === "en" ? "en" : "ja", path),
      301,
    )
  }
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
