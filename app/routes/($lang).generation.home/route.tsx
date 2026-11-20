import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  GenerationHomeView,
  GenerationHomeWorksQuery,
} from "~/routes/($lang).generation.home/components/generation-home-view"
import {
  GENERATION_HOME_PAGE_SIZE,
  toGenerationHomeWorksWhere,
} from "~/routes/($lang).generation.home/utils/home-works-where"
import { createMeta } from "~/utils/create-meta"

/**
 * /generation と同じ内容の入口なので検索には出さない
 */
export const meta: MetaFunction = (props) => {
  return createMeta(
    { ...META.GENERATION, isIndex: false },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  // 作例が読めなくても入力欄は使えるので、失敗したら運営が選んだ作例を出す
  try {
    const result = await loaderClient.query({
      query: GenerationHomeWorksQuery,
      variables: {
        offset: 0,
        limit: GENERATION_HOME_PAGE_SIZE,
        where: toGenerationHomeWorksWhere({ kind: "popular" }, new Date()),
      },
    })
    return { works: result.data.works }
  } catch {
    return { works: [] }
  }
}

export const headers: HeadersFunction = ({ parentHeaders }) => ({
  // 画像生成のメンテナンス中は親（生成画面の枠）が no-store にする
  "Cache-Control":
    parentHeaders.get("Cache-Control") === "no-store"
      ? "no-store"
      : config.cacheControl.oneHour,
})

/**
 * 画像生成のトップ（はじめての人向け）: プロンプトの入力欄と生成ボタン、その下に作例を並べる
 */
export default function GenerationHomePage() {
  const data = useLoaderData<typeof loader>()

  return <GenerationHomeView initialWorks={data.works} />
}
