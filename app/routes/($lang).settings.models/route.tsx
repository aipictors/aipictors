import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

/**
 * 自分のモデルはモデルライブラリの「マイモデル」にまとめた
 */
export async function loader(props: LoaderFunctionArgs) {
  const prefix = props.params.lang ? `/${props.params.lang}` : ""
  return redirect(`${prefix}/models/library?section=mine`, { status: 302 })
}
