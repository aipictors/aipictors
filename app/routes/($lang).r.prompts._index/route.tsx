import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { SeoHubIndexView } from "~/components/seo-hubs/seo-hub-index-view"
import { loadHubIndex } from "~/lib/seo-hubs/seo-hub-catalog.server"
import { seoHubHeaders, seoHubIndexMeta } from "~/lib/seo-hubs/seo-hub-route"

/**
 * 呪文まとめの索引（R18）。同梱の JSON から作るので API・D1 は読まない
 */
export async function loader(_props: LoaderFunctionArgs) {
  return loadHubIndex(true)
}

export const headers = seoHubHeaders

export const meta: MetaFunction<typeof loader> = (props) =>
  seoHubIndexMeta(props.data, props.params.lang)

export default function SensitivePromptHubIndexPage() {
  const data = useLoaderData<typeof loader>()
  return <SeoHubIndexView {...data} />
}
