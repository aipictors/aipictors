import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

/**
 * 課金の案内を出した・押したなどの回数を数えるための空の応答
 * 中身は保存せず、Cloudflare のアクセス集計（パスとクエリ）で数える
 * 例: /api/growth-event?ev=limit_view&src=generation
 */
export async function loader(_props: LoaderFunctionArgs) {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  })
}
