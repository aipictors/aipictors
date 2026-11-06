import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

/**
 * ページ表示の計測用の空の応答（app/utils/page-view.ts）
 * 中身は保存せず、Cloudflare のアクセス集計（パスとクエリ）で数える
 */
export async function loader(_props: LoaderFunctionArgs) {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  })
}
