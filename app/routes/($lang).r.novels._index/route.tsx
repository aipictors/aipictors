import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { loadReadingWorks } from "~/components/works-index/reading-works-loader.server"
import { toReadingMeta } from "~/components/works-index/reading-works-meta"
import { ReadingWorksPage } from "~/components/works-index/reading-works-page"
import { config } from "~/config"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export const meta: MetaFunction<typeof loader> = (props) => {
  return createSensitiveMeta(
    toReadingMeta("novel", props.data, { isSensitive: true }),
    undefined,
    props.params.lang,
  )
}

export async function loader(props: LoaderFunctionArgs) {
  return loadReadingWorks("novel", props.request, { isSensitive: true })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * R18 の小説の一覧（全年齢の /novels と同じ作り）
 */
export default function SensitiveNovels() {
  const data = useLoaderData<typeof loader>()

  return <ReadingWorksPage data={data} />
}
