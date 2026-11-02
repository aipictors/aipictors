import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * 試作のまま公開されなかった画像生成の画面の URL。今の画像生成へ移す
 */
export async function loader(props: LoaderFunctionArgs) {
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, "/generation"), { status: 301 })
}
