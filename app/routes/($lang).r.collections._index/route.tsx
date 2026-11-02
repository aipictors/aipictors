import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * /collections と同じく全体の一覧を出さない（/r/collections/:id は残る）
 * R18 のまま作品のまとまりを見られるよう、R18 のシリーズ一覧へ案内する
 */
export async function loader(props: LoaderFunctionArgs) {
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, "/r/albums"), { status: 301 })
}
