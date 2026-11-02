import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import type { ShouldRevalidateFunction } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { GenreWorksPage } from "~/components/genre-works/genre-works-page"
import { loadGenreWorks } from "~/components/genre-works/genre-works-loader.server"
import { config, META } from "~/config"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export const meta: MetaFunction = (props) =>
  createSensitiveMeta(META.SENSITIVE_HOME_3D, undefined, props.params.lang)

export async function loader(_props: LoaderFunctionArgs) {
  return loadGenreWorks("3d", { isSensitive: true })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

/**
 * ページ送りなどでクエリだけが変わるときは読み直さない（この loader の内容はクエリで変わらない）
 */
export const shouldRevalidate: ShouldRevalidateFunction = (props) => {
  if (props.currentUrl.pathname === props.nextUrl.pathname) {
    return false
  }
  return props.defaultShouldRevalidate
}

/**
 * R18 の 3d の作品の入口（全年齢の /posts/3d と同じ作り）
 */
export default function SensitivePosts() {
  const data = useLoaderData<typeof loader>()

  return <GenreWorksPage genreKey="3d" data={data} isSensitive={true} />
}
