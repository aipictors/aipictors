import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { buildLocalePath, getPathLocale } from "~/utils/locale-path"

/**
 * コレクションは全体の一覧を出さない（/collections/:id は残る）
 * 約 20 万件の大半が題名も作品もない自動作成のもので、API では作品のあるものだけに絞れない。
 * 作品のまとまりを見たい人には、公開されているシリーズの一覧を案内する
 */
export async function loader(props: LoaderFunctionArgs) {
  const locale = getPathLocale(new URL(props.request.url).pathname)
  return redirect(buildLocalePath(locale, "/albums"), { status: 301 })
}
