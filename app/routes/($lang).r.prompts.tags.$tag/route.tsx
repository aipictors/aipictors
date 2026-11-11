import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { SeoHubView } from "~/components/seo-hubs/seo-hub-view"
import { fetchTagHub } from "~/lib/seo-hubs/seo-hub-data.server"
import { seoHubHeaders, seoHubMeta } from "~/lib/seo-hubs/seo-hub-route"

/**
 * タグ・キャラクターの呪文まとめ（R18）
 */
export async function loader(props: LoaderFunctionArgs) {
  const tag = decodeURIComponent(props.params.tag ?? "").trim()
  if (tag.length === 0) throw new Response(null, { status: 404 })
  const data = await fetchTagHub({ tag, isSensitive: true })
  if (!data) throw new Response(null, { status: 404 })
  return data
}

export const headers = seoHubHeaders

export const meta: MetaFunction<typeof loader> = (props) =>
  seoHubMeta(props.data, props.params.lang)

export default function SensitivePromptTagHubPage() {
  const data = useLoaderData<typeof loader>()
  return <SeoHubView key={data.name} data={data} />
}
