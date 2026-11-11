import {
  type HeadersFunction,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { config, META } from "~/config"
import {
  loadRookieRanking,
  RookieRanking,
} from "~/routes/($lang)._main.rankings._index/components/rookie-ranking"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  const data = await loadRookieRanking(props.request, false)
  // 順位は 1 日 1 回しか変わらないので、ページもデータも拠点のキャッシュから返す
  return json(data, {
    headers: { "Cache-Control": config.cacheControl.oneDay },
  })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.ROOKIE_RANKINGS, undefined, props.params.lang)
}

export default function RookieRankings() {
  const data = useLoaderData<typeof loader>()
  return <RookieRanking {...data} />
}
