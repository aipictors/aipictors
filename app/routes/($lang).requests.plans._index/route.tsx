import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

/**
 * プラン一覧は /requests（リクエストのトップ）に移した。絞り込みの条件はそのまま渡す
 */
export function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const prefix = params.lang ? `/${params.lang}` : ""
  return redirect(`${prefix}/requests${url.search}`, 301)
}
