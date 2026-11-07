import { json, type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

/**
 * 以前の「ピックアップ」（/home）。いまはトップ（/）がホームなので / へ転送する。
 * 下のページ（/home/recommended）はそのまま出す
 */
export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const match = url.pathname.match(/^(\/(?:ja|en))?\/home\/?$/)
  if (match) {
    return redirect(`${match[1] ?? "/"}${url.search}`, { status: 301 })
  }
  return json(null)
}

export default function HomePage() {
  return <Outlet />
}
