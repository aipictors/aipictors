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
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction<typeof loader> = (props) => {
  return createMeta(
    {
      ...META.POSTS_2D,
      image: props.data?.heroWorks[0]?.largeThumbnailImageURL ?? undefined,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return loadGenreWorks("2d")
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
 * 2D（イラスト）の作品の入口
 */
export default function Posts2d() {
  const data = useLoaderData<typeof loader>()

  return <GenreWorksPage genreKey="2d" data={data} />
}
