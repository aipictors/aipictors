import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

/**
 * 以前の R18 のホーム（/r/home）。いまは /r がホームなので /r へ転送する
 */
export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const prefix = url.pathname.match(/^\/(?:ja|en)(?=\/)/)?.[0] ?? ""
  return redirect(`${prefix}/r${url.search}`, { status: 301 })
}

export default function SensitiveHomePage() {
  return null
}
