import {
  type HeadersFunction,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { loadPopularWorks } from "~/components/popular-works/popular-works-loader.server"
import { PopularWorksPage } from "~/components/popular-works/popular-works-page"
import { config, META } from "~/config"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export async function loader(props: LoaderFunctionArgs) {
  // R18 の作品はログインしている人にしか API が返さないので、ここでは日付だけ決める（作品は画面で読む）
  const result = await loadPopularWorks({
    request: props.request,
    isSensitive: true,
  })

  return json(result.data, {
    headers: { "Cache-Control": result.cacheControl },
  })
}

export const headers: HeadersFunction = (props) => ({
  "Cache-Control":
    props.loaderHeaders.get("Cache-Control") ?? config.cacheControl.oneHour,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const isLatest = props.data?.isLatest ?? true
  return createSensitiveMeta(
    { ...META.SENSITIVE_POPULAR_WORKS, isIndex: isLatest },
    undefined,
    props.params.lang,
  )
}

/**
 * 今日の R18 人気作品
 */
export default function SensitivePopularWorks() {
  const data = useLoaderData<typeof loader>()

  return (
    <PopularWorksPage
      date={data.date}
      today={data.today}
      isSensitive={true}
      works={[]}
    />
  )
}
