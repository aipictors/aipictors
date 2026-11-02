import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { config, META } from "~/config"
import { ArchivePage } from "~/routes/($lang)._main.archive._index/components/archive-page"
import { loadArchive } from "~/routes/($lang)._main.archive._index/utils/load-archive.server"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.ARCHIVE, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export async function loader(props: LoaderFunctionArgs) {
  return loadArchive(props.request)
}

export default function Archive() {
  const data = useLoaderData<typeof loader>()

  return <ArchivePage data={data} />
}
