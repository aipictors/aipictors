import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * 運営のお知らせは更新情報（/releases）に移った
 * API のお知らせは 2024 年 7 月で止まっている
 */
export async function loader(props: LoaderFunctionArgs) {
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, "/releases"), { status: 301 })
}
