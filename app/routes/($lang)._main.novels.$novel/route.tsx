import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * 小説の詳細は作品ページ（/posts/:id）にまとまっている
 */
export async function loader(props: LoaderFunctionArgs) {
  const id = props.params.novel ?? ""
  if (!/^\d+$/.test(id)) {
    throw new Response(null, { status: 404 })
  }
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, `/posts/${id}`), { status: 301 })
}

// 404 のときにサイトのエラーページを出すために必要
export default function Route() {
  return null
}
