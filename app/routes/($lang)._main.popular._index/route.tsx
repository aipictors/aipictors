import {
  type HeadersFunction,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { loadPopularWorks } from "~/components/popular-works/popular-works-loader.server"
import { PopularWorksPage } from "~/components/popular-works/popular-works-page"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createCollectionJsonLd } from "~/utils/collection-json-ld"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  const result = await loadPopularWorks({
    request: props.request,
    isSensitive: false,
  })

  // ログインに関係なく同じ一覧なので、ページ移動（データだけの取得）も拠点のキャッシュから返す
  return json(result.data, {
    headers: { "Cache-Control": result.cacheControl },
  })
}

export const headers: HeadersFunction = (props) => ({
  "Cache-Control":
    props.loaderHeaders.get("Cache-Control") ?? config.cacheControl.oneHour,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  // 日付を指定した過去の一覧は検索結果に出さない（最新の /popular だけ）
  const isLatest = props.data?.isLatest ?? true
  return createMeta(
    { ...META.POPULAR_WORKS, isIndex: isLatest },
    undefined,
    props.params.lang,
  )
}

/**
 * 今日の人気作品（全年齢）
 */
export default function PopularWorks() {
  const t = useTranslation()
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  return (
    <>
      <AppJsonLdScript
        jsonLd={createCollectionJsonLd({
          name: t("今日の人気作品", "Today's popular works"),
          path: "/popular",
          lang: params.lang,
          items: data.works.map((work) => ({
            name: t.workTitle(work.title, work.enTitle),
            path: `/posts/${work.id}`,
          })),
        })}
      />
      <PopularWorksPage
        date={data.date}
        today={data.today}
        isSensitive={false}
        works={data.works}
      />
    </>
  )
}
