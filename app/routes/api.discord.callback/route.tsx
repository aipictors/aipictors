import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

/**
 * Discord から戻ってくるところ。
 * 連携の完了はログイン中の本人の確認が要るので、設定のページへ渡して、そこから行う
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  const params = url.searchParams.get("error")
    ? { result: "canceled" }
    : code && state
      ? { code, state }
      : { result: "error" }

  return new Response(null, {
    status: 302,
    headers: {
      location: `/settings/discord?${new URLSearchParams(params).toString()}`,
      "cache-control": "no-store",
    },
  })
}
