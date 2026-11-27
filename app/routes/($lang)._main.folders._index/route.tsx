import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * /folders は中身のない空のページだったので、自分のコレクションの管理へ案内する
 */
export async function loader(props: LoaderFunctionArgs) {
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, "/my/folders"), { status: 302 })
}
