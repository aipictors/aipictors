import { redirect } from "@remix-run/cloudflare"
import type { LoaderFunction } from "@remix-run/cloudflare"

/**
 * /stickerへのアクセスを/stickersにリダイレクトする
 */
export const loader: LoaderFunction = async ({ params }) => {
  const lang = params.lang || "ja"
  return redirect(`/${lang}/stickers`, 301)
}
