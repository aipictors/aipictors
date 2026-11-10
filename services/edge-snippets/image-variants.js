// Cloudflare Snippet（ルール: www の /_w/*）。縮小版が R2 にあれば Worker を起動せずに返す
export default {
  async fetch(request) {
    const path = new URL(request.url).pathname
    if (request.method === "GET" && path.startsWith("/_w/")) {
      const variant = await fetch("https://variants.aipictors.com/v2/" + path.slice(4))
      if (variant.ok) {
        const response = new Response(variant.body, variant)
        response.headers.set("cache-control", "public, max-age=31536000, immutable")
        response.headers.set("content-type", "image/webp")
        response.headers.set("access-control-allow-origin", "*")
        response.headers.set("x-resize", "snippet")
        return response
      }
      // <img> 以外（クローラー・一括取得）のために Worker を起動して作らない（image-resize-worker と同じ判定）
      if (request.headers.get("sec-fetch-dest") === null) {
        const key = path.split("/").slice(3).join("/")
        return new Response(null, {
          status: 302,
          headers: {
            location: "https://files.aipictors.com/" + key,
            "cache-control": "no-store",
            "x-resize": "skip-non-browser",
            "access-control-allow-origin": "*",
          },
        })
      }
    }
    return fetch(request)
  },
}
