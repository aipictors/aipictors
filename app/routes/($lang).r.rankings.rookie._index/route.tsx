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
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export async function loader(props: LoaderFunctionArgs) {
  const data = await loadRookieRanking(props.request, true)
  return json(data, {
    headers: { "Cache-Control": config.cacheControl.oneDay },
  })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createSensitiveMeta(
    META.SENSITIVE_ROOKIE_RANKINGS,
    undefined,
    props.params.lang,
  )
}

export default function SensitiveRookieRankings() {
  const data = useLoaderData<typeof loader>()
  return <RookieRanking {...data} />
}
