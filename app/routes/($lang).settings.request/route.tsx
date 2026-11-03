import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

/**
 * 「サポートを受け取る」は廃止した。古いリンクは応援コインの受け取りへ送る
 */
export async function loader(props: LoaderFunctionArgs) {
  const prefix = props.params.lang ? `/${props.params.lang}` : ""
  return redirect(`${prefix}/settings/support-received`, 301)
}
