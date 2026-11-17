import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

/**
 * プランの作成・編集は /requests/my-plans（リクエストの「自分のプラン」）に移した
 * アプリやお知らせの古いリンクのために残す
 */
export function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const prefix = params.lang ? `/${params.lang}` : ""
  return redirect(`${prefix}/requests/my-plans${url.search}`, 301)
}
