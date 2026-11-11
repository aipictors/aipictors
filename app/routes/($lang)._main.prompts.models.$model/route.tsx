import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { SeoHubView } from "~/components/seo-hubs/seo-hub-view"
import { fetchModelHub } from "~/lib/seo-hubs/seo-hub-data.server"
import { seoHubHeaders, seoHubMeta } from "~/lib/seo-hubs/seo-hub-route"

/**
 * モデルの呪文まとめ（全年齢）
 */
export async function loader(props: LoaderFunctionArgs) {
  const model = decodeURIComponent(props.params.model ?? "").trim()
  if (model.length === 0) throw new Response(null, { status: 404 })
  const data = await fetchModelHub({ model, isSensitive: false })
  if (!data) throw new Response(null, { status: 404 })
  return data
}

export const headers = seoHubHeaders

export const meta: MetaFunction<typeof loader> = (props) =>
  seoHubMeta(props.data, props.params.lang)

export default function PromptModelHubPage() {
  const data = useLoaderData<typeof loader>()
  return <SeoHubView key={data.name} data={data} />
}
