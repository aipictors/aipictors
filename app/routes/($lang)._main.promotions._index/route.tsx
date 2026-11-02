import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * プロモーションはイベントの一覧（/events）に案内する
 * API に残っているのは 2023 年に終わったイベントの 1 件だけ
 */
export async function loader(props: LoaderFunctionArgs) {
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, "/events"), { status: 301 })
}
