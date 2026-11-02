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
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction<typeof loader> = (props) => {
  return createMeta(
    toReadingMeta("column", props.data),
    undefined,
    props.params.lang,
  )
}

export async function loader(props: LoaderFunctionArgs) {
  return loadReadingWorks("column", props.request)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * コラムの一覧
 */
export default function Notes() {
  const data = useLoaderData<typeof loader>()

  return <ReadingWorksPage data={data} />
}
