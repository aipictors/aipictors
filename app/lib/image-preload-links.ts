/**
 * HTML の優先画像（fetchpriority="high" の <img>）を、Link ヘッダーの preload にする。
 *
 * <head> に CSS を入れたぶん <img> が HTML の後ろの方になり、回線の遅いスマホでは
 * ブラウザが画像を見つけて読み始めるまで 1 秒以上かかっていた（ページで一番大きく見える画像＝LCP）。
 * Link ヘッダーなら HTML を読む前（Cloudflare の Early Hints では応答の前）に読み始められる。
 * <head> に要素を足すと hydration で React と食い違うので、ヘッダーにする。
 */

const IMG_TAG = /<img\b[^>]*\bfetch[pP]riority="high"[^>]*>/g

const attr = (tag: string, name: string): string | undefined => {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))
  return match?.[1]?.replaceAll("&amp;", "&")
}

/**
 * Link ヘッダーの値（1 枚につき 1 つ）。最大 limit 枚
 */
export const toImagePreloadLinks = (html: string, limit = 2): string[] => {
  const links: string[] = []
  for (const match of html.matchAll(IMG_TAG)) {
    if (links.length >= limit) break
    const tag = match[0]
    const src = attr(tag, "src")
    if (!src || src.startsWith("data:")) continue
    const srcset = attr(tag, "srcset")
    const sizes = attr(tag, "sizes")
    // <picture> で画面幅によって空の画像に差し替えている場合（OptimizedImage の media）は同じ条件を付ける
    const before = html.slice(Math.max(0, match.index - 400), match.index)
    const media = before
      .match(/<source media="not all and ([^"]+)"[^>]*>\s*$/)?.[1]
      ?.replaceAll("&amp;", "&")
    const params = [`<${src}>`, "rel=preload", "as=image", "fetchpriority=high"]
    if (srcset) {
      params.push(`imagesrcset="${srcset}"`)
      if (sizes) params.push(`imagesizes="${sizes}"`)
    }
    if (media) params.push(`media="${media}"`)
    links.push(params.join("; "))
  }
  return links
}
