import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { config, META } from "~/config"
import { ArchivePage } from "~/routes/($lang)._main.archive._index/components/archive-page"
import { loadArchive } from "~/routes/($lang)._main.archive._index/utils/load-archive.server"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export const meta: MetaFunction = (props) =>
  createSensitiveMeta(META.ARCHIVE_SENSITIVE, undefined, props.params.lang)

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export async function loader(props: LoaderFunctionArgs) {
  return loadArchive(props.request, { isSensitive: true })
}

/**
 * R18 の過去の名作（全年齢の /archive と同じ作り）
 */
export default function SensitiveArchive() {
  const data = useLoaderData<typeof loader>()

  return <ArchivePage data={data} isSensitive={true} />
}
