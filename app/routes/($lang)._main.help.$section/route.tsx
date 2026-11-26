import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { META } from "~/config"
import { HelpSectionPage } from "~/routes/($lang)._main.help._index/components/help-section-page"
import { findHelpSection } from "~/routes/($lang)._main.help._index/components/help-sections"
import { createMeta } from "~/utils/create-meta"

/**
 * 使い方ガイドの章のページ（/help/coins など）。/help/faq・/help/withdrawal は別のルート（静的なほうが先に当たる）
 * 中身はコードの中（help-sections.ts）にあり、API は読まない
 */
export async function loader(props: LoaderFunctionArgs) {
  const section = findHelpSection(
    props.params.section ?? sectionIdFromUrl(props.request.url),
  )
  if (!section) throw new Response(null, { status: 404 })
  return { sectionId: section.id }
}

/**
 * 章の id が /search・/generation など別のページと同じ名前のときは、/help/search が
 * ($lang)/search（lang=help）に取られて 404 になるので、静的なルート（($lang)._main.help.search など）を
 * 置いてこのルートを再利用する。そのときは params に section がないので URL の最後から取る
 */
function sectionIdFromUrl(url: string) {
  const last = new URL(url).pathname.split("/").pop() ?? ""
  return last.replace(/\.data$/, "")
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const section = findHelpSection(props.data?.sectionId ?? "")
  if (!section) {
    return [
      { title: "404 - Aipictors" },
      { name: "robots", content: "noindex" },
    ]
  }
  return createMeta(
    {
      title: `${section.title.ja}｜使い方ガイド`,
      enTitle: `${section.title.en} | User Guide`,
      description: `${section.summary.ja}。${section.lead.ja}`,
      enDescription: `${section.summary.en}. ${section.lead.en}`,
      image: META.HELP.image,
      isIndex: true,
    },
    undefined,
    props.params.lang,
  )
}

export default function HelpSectionRoute() {
  const { sectionId } = useLoaderData<typeof loader>()
  const section = findHelpSection(sectionId)
  if (!section) return null
  return <HelpSectionPage key={section.id} section={section} />
}
